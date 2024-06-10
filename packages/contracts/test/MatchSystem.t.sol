// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { ResourceId, ResourceIdLib } from "@latticexyz/store/src/ResourceId.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";

import { _balancesTableId } from "@latticexyz/world-modules/src/modules/erc20-puppet/utils.sol";
import { Balances } from "@latticexyz/world-modules/src/modules/tokens/tables/Balances.sol";
import { Puppet } from "@latticexyz/world-modules/src/modules/puppet/Puppet.sol";
import { IERC20Mintable } from "@latticexyz/world-modules/src/modules/erc20-puppet/IERC20Mintable.sol";

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import { SkyStrifeTest, createPublicMatch, findFirstMatchInWindow } from "./SkyStrifeTest.sol";

import { SpawnSettlementTemplateId, HalberdierTemplateId } from "../src/codegen/Templates.sol";
import { calculateCurrentPrice } from "../src/systems/SeasonPassSystem.sol";
import { dispenseRewards } from "../src/libraries/LibSkyPool.sol";
import { addressToEntity } from "../src/libraries/LibUtils.sol";
import { createLevelIndex } from "../src/libraries/levels/createLevel.sol";

import { Admin, SeasonPassPrivateMatchLimit, MatchIndex, MatchConfig, MatchConfigData, MatchRanking, LevelTemplatesIndex, OwnedBy, SkyPoolConfig, SeasonPassConfig, SeasonPassLastSaleAt } from "../src/codegen/index.sol";
import { MatchReward, LastMatchIndex, MatchRewardPercentages, MatchesPerDay, MatchEntityCounter, UnitType, OwnedBy, MatchPlayers, SpawnPoint, MatchPlayer, MatchSky } from "../src/codegen/index.sol";

import { SeasonPassSystem, calculateCurrentPrice } from "../src/systems/SeasonPassSystem.sol";

import { MATCHES_PER_DAY_HARD_CAP } from "../constants.sol";

import { SEASON_PASS_STARTING_PRICE, SEASON_PASS_PURCHASE_MULTIPLIER_PERCENT, SEASON_PASS_PRICE_DECREASE_PER_SECOND } from "../script/PostDeploy.s.sol";

uint256 constant COST = 100 ether;
uint256 constant BALANCE = 250 ether;
bytes32 constant LEVEL_ID = "debug";

contract MatchSystemTest is SkyStrifeTest, GasReporter {
  using WorldResourceIdInstance for ResourceId;
  ResourceId accessSystemId;

  function createMatchSetup() internal returns (bytes32) {
    IERC20Mintable token = IERC20Mintable(SkyPoolConfig.getOrbToken());
    ResourceId systemId = Puppet(address(token)).systemId();
    ResourceId tableId = _balancesTableId(systemId.getNamespace());
    bytes32 firstMatchInWindow = findFirstMatchInWindow();
    bytes32 matchEntity;

    prankAdmin();
    SkyPoolConfig.setCost(COST);
    token.mint(alice, BALANCE);
    vm.stopPrank();

    assertEq(Balances.get(tableId, alice), BALANCE);

    vm.startPrank(alice);

    startGasReport("create public match");
    world.createMatch("match", firstMatchInWindow, matchEntity, LEVEL_ID);
    endGasReport();
    vm.stopPrank();

    return matchEntity;
  }

  function testCreateMatch() public {
    IERC20Mintable token = IERC20Mintable(SkyPoolConfig.getOrbToken());
    ResourceId systemId = Puppet(address(token)).systemId();
    ResourceId tableId = _balancesTableId(systemId.getNamespace());

    uint256 day = block.timestamp / 1 days;
    uint256 matchesToday = MatchesPerDay.get(day);

    bytes32 matchEntity = createMatchSetup();
    // Check creators balance was deducted
    assertEq(Balances.get(tableId, alice), BALANCE - COST);

    // Check match was created properly
    assertEq(MatchConfig.get(matchEntity).startTime, 0);
    assertEq(MatchConfig.get(matchEntity).turnLength, 15);
    assertEq(MatchConfig.get(matchEntity).levelId, LEVEL_ID);
    assertEq(MatchIndex.get(matchEntity), 3);

    assertEq(MatchesPerDay.get(day), matchesToday + 1);
  }

  function testCreatePrivateMatch() public {
    prankAdmin();
    SeasonPassPrivateMatchLimit.set(1);
    vm.stopPrank();

    vm.startPrank(alice);
    world.buySeasonPass{ value: calculateCurrentPrice() }(alice);

    bytes32 matchEntity = keccak256("match");
    ResourceId systemId = ResourceIdLib.encode("1", "1");
    uint256 entranceFee = 100 ether;
    uint256[] memory rewardPercentages = new uint256[](1);
    rewardPercentages[0] = 100;
    bytes32 firstMatchInWindow = findFirstMatchInWindow();

    world.createMatchSeasonPass(
      "match",
      firstMatchInWindow,
      matchEntity,
      LEVEL_ID,
      systemId,
      entranceFee,
      rewardPercentages
    );

    matchEntity = keccak256("match2");
    vm.expectRevert("private match limit reached");
    world.createMatchSeasonPass(
      "match",
      firstMatchInWindow,
      matchEntity,
      LEVEL_ID,
      systemId,
      entranceFee,
      rewardPercentages
    );

    vm.stopPrank();
  }

  function testMatchCancel() public {
    bytes32 matchEntity;
    IERC20Mintable token = IERC20Mintable(SkyPoolConfig.getOrbToken());

    testCreateMatch();
    address escrowContract = MatchConfig.getEscrowContract(matchEntity);

    // spent 100 to create match
    assertEq(token.balanceOf(alice), BALANCE - 100 ether, "alice should have nothing after creating match");
    assertEq(token.balanceOf(escrowContract), 300 ether, "incorrect escrow contract balance");

    vm.startPrank(alice);
    world.cancelMatch(matchEntity);
    vm.stopPrank();

    assertEq(token.balanceOf(escrowContract), 0, "escrow contract not empty after match completion");

    // get 90 back
    assertEq(token.balanceOf(alice), BALANCE - 10 ether, "refund amount incorrect");

    vm.startPrank(alice);
    vm.expectRevert("not a valid match");
    world.cancelMatch(matchEntity);
    vm.stopPrank();
  }

  function testMatchCancelWithRewardsBelowCost() public {
    bytes32 matchEntity;
    IERC20Mintable token = IERC20Mintable(SkyPoolConfig.getOrbToken());

    prankAdmin();
    LastMatchIndex.set(5000); // a number of matches that will make this match have the minimum reward
    vm.stopPrank();

    createMatchSetup();
    address escrowContract = MatchConfig.getEscrowContract(matchEntity);

    // spent 100 to create match
    assertEq(token.balanceOf(alice), BALANCE - 100 ether, "alice should have nothing after creating match");
    assertEq(token.balanceOf(escrowContract), 50 ether, "incorrect escrow contract balance");

    vm.startPrank(alice);
    world.cancelMatch(matchEntity);
    vm.stopPrank();

    assertEq(token.balanceOf(escrowContract), 0, "escrow contract not empty after match cancellation");

    // get the reward back if below cost
    assertEq(token.balanceOf(alice), BALANCE - 50 ether, "refund amount incorrect");
  }

  function testMustCancelValidMatch() public {
    bytes32 matchEntity = keccak256("this match does not exist");

    vm.startPrank(alice);
    vm.expectRevert("not a valid match");
    world.cancelMatch(matchEntity);
    vm.stopPrank();
  }

  function testMatchCancelWithEntranceFee() public {
    IERC20Mintable token = IERC20Mintable(SkyPoolConfig.getOrbToken());

    bytes32 matchEntity = keccak256("match");
    uint256 entranceFee = 10 ether;
    uint256[] memory rewardPercentages = new uint256[](3);
    rewardPercentages[0] = 100;
    rewardPercentages[1] = 0;
    rewardPercentages[2] = 0;
    bytes32 firstMatchInWindow = findFirstMatchInWindow();

    prankAdmin();
    SkyPoolConfig.setCost(COST);
    token.mint(alice, COST + 10 ether);
    token.mint(bob, 10 ether);

    createLevelIndex(LEVEL_ID, 0, SpawnSettlementTemplateId, 0, 0);
    createLevelIndex(LEVEL_ID, 1, SpawnSettlementTemplateId, 0, 1);
    vm.stopPrank();

    vm.startPrank(alice);
    world.buySeasonPass{ value: calculateCurrentPrice() }(alice);
    world.createMatchSeasonPass(
      "match",
      firstMatchInWindow,
      matchEntity,
      LEVEL_ID,
      accessSystemId,
      entranceFee,
      rewardPercentages
    );
    address escrowContract = MatchConfig.getEscrowContract(matchEntity);

    world.register(matchEntity, 0, HalberdierTemplateId);
    vm.stopPrank();

    vm.startPrank(bob);
    world.register(matchEntity, 1, HalberdierTemplateId);
    vm.stopPrank();

    assertEq(token.balanceOf(alice), 0, "alice should have nothing after joining match");
    assertEq(token.balanceOf(bob), 0, "bob should have nothing after joining match");

    vm.startPrank(alice);
    world.cancelMatch(matchEntity);
    vm.stopPrank();

    assertEq(token.balanceOf(alice), 100 ether, "alice should have entrance fee back");
    assertEq(token.balanceOf(bob), 10 ether, "bob should have entrance fee back");
    assertEq(token.balanceOf(escrowContract), 0, "escrow contract not empty after match completion");
  }

  function testAnyoneCanCancelStaleMatches() public {
    bytes32 matchEntity;
    IERC20Mintable token = IERC20Mintable(SkyPoolConfig.getOrbToken());

    testCreateMatch();

    vm.warp(block.timestamp + 1 hours + 1 seconds);

    vm.startPrank(eve);
    world.cancelMatch(matchEntity);
    vm.stopPrank();

    // get 90 back
    assertEq(token.balanceOf(alice), BALANCE - 10 ether, "refund amount incorrect");
  }

  function testCreatorMustCancelMatch() public {
    bytes32 matchEntity;
    testCreateMatch();

    vm.startPrank(bob);
    vm.expectRevert("only the creator of a match can cancel it");
    world.cancelMatch(matchEntity);
    vm.stopPrank();
  }

  function testAdminCancelIsFullRefund() public {
    bytes32 matchEntity;
    IERC20Mintable token = IERC20Mintable(SkyPoolConfig.getOrbToken());

    testCreateMatch();
    address escrowContract = MatchConfig.getEscrowContract(matchEntity);

    prankAdmin();
    world.cancelMatch(matchEntity);
    vm.stopPrank();

    assertEq(token.balanceOf(escrowContract), 0, "escrow contract not empty after match completion");

    // get 90 back
    assertEq(token.balanceOf(alice), BALANCE, "refund amount incorrect");
  }

  function testLeavingMatch() public {
    bytes32 matchEntity;
    testCreateMatch();

    prankAdmin();
    createLevelIndex(LEVEL_ID, 0, SpawnSettlementTemplateId, 0, 0);
    vm.stopPrank();

    vm.startPrank(alice);

    world.register(matchEntity, 0, HalberdierTemplateId);

    bytes32 playerEntity = MatchPlayer.get(matchEntity, alice);
    bytes32 heroEntity;
    uint32 totalMatchEntities = MatchEntityCounter.get(matchEntity);
    for (uint32 i = 0; i <= totalMatchEntities; i++) {
      bytes32 entity = bytes32(uint256(i));
      if (!SpawnPoint.get(matchEntity, entity) && OwnedBy.get(matchEntity, entity) == playerEntity) {
        heroEntity = entity;
      }
    }

    world.deregister(matchEntity, 0, heroEntity);

    world.register(matchEntity, 0, HalberdierTemplateId);
    playerEntity = MatchPlayer.get(matchEntity, alice);
    totalMatchEntities = MatchEntityCounter.get(matchEntity);
    for (uint32 i = 0; i <= totalMatchEntities; i++) {
      bytes32 entity = bytes32(uint256(i));
      if (!SpawnPoint.get(matchEntity, entity) && OwnedBy.get(matchEntity, entity) == playerEntity) {
        heroEntity = entity;
      }
    }
    world.deregister(matchEntity, 0, heroEntity);
    vm.stopPrank();
  }

  function testLeavingMustOwnSpawnIndex() public {
    bytes32 matchEntity;
    testCreateMatch();

    prankAdmin();
    createLevelIndex(LEVEL_ID, 0, SpawnSettlementTemplateId, 0, 0);
    createLevelIndex(LEVEL_ID, 1, SpawnSettlementTemplateId, 0, 1);
    vm.stopPrank();

    vm.startPrank(bob);
    world.register(matchEntity, 1, HalberdierTemplateId);
    vm.stopPrank();

    vm.startPrank(alice);

    world.register(matchEntity, 0, HalberdierTemplateId);

    bytes32 playerEntity = MatchPlayer.get(matchEntity, alice);
    bytes32 heroEntity;
    uint32 totalMatchEntities = MatchEntityCounter.get(matchEntity);
    for (uint32 i = 0; i <= totalMatchEntities; i++) {
      bytes32 entity = bytes32(uint256(i));
      if (!SpawnPoint.get(matchEntity, entity) && OwnedBy.get(matchEntity, entity) == playerEntity) {
        heroEntity = entity;
      }
    }

    vm.expectRevert("invalid spawn index");
    world.deregister(matchEntity, 1, heroEntity);
    vm.stopPrank();
  }

  function testMatchPerDayHardCap() public {
    uint256 today = block.timestamp / 1 days;

    prankAdmin();
    MatchesPerDay.set(today, MATCHES_PER_DAY_HARD_CAP + 1);
    vm.stopPrank();

    bytes32 firstMatchInWindow = findFirstMatchInWindow();
    bytes32 matchEntity;

    vm.startPrank(alice);
    vm.expectRevert("too many matches created today");
    world.createMatch("too many", firstMatchInWindow, matchEntity, LEVEL_ID);
    vm.stopPrank();

    vm.warp(block.timestamp + 1 days);

    bytes32 createdMatch = createPublicMatch(world, "debug");
    assertEq(MatchConfig.getTurnLength(createdMatch), 15);
  }

  function testCreateMatchNameTooLong() public {
    bytes32 firstMatchInWindow = findFirstMatchInWindow();
    bytes32 matchEntity;

    vm.startPrank(alice);
    vm.expectRevert("name too long");
    world.createMatch("andyandyandyandyandyandyandy", firstMatchInWindow, matchEntity, LEVEL_ID);
    vm.stopPrank();
  }

  function testSeasonPassPriceDecreaseRate() public {
    uint256 startingPrice = 10 ether;
    uint256 minPrice = 1 ether;
    uint256 rate = 86806;
    uint256 lastSaleAt = block.timestamp;

    uint256 price;

    prankAdmin();
    SeasonPassConfig.setStartingPrice(startingPrice);
    SeasonPassConfig.setMinPrice(minPrice);
    SeasonPassConfig.setRate(rate);
    SeasonPassLastSaleAt.set(lastSaleAt);

    vm.warp(block.timestamp + 1 days);
    vm.stopPrank();

    price = calculateCurrentPrice();

    assertTrue(price < 2.5 ether && price > 2.4 ether, "incorrect price");
  }

  function testBuySeasonPassOverpaying(uint256 overpayAmount) public {
    vm.assume(overpayAmount < alice.balance - SEASON_PASS_STARTING_PRICE);

    address token = SkyPoolConfig.getSeasonPassToken();
    ResourceId systemId = Puppet(token).systemId();
    ResourceId tableId = _balancesTableId(systemId.getNamespace());

    uint256 originalBalance = alice.balance;
    uint256 value = SEASON_PASS_STARTING_PRICE + overpayAmount;

    prankAdmin();
    SeasonPassLastSaleAt.set(block.timestamp);
    vm.stopPrank();

    vm.startPrank(alice);
    world.buySeasonPass{ value: value }(alice);
    vm.stopPrank();

    // Should refund the difference
    assertEq(alice.balance, originalBalance - SEASON_PASS_STARTING_PRICE);
  }

  function testBuySeasonPass() public {
    address token = SkyPoolConfig.getSeasonPassToken();
    ResourceId systemId = Puppet(token).systemId();
    ResourceId tableId = _balancesTableId(systemId.getNamespace());
    uint256 value = SEASON_PASS_STARTING_PRICE;

    vm.startPrank(alice);

    // Attempt to buy season pass without paying
    vm.expectRevert("you must pay enough");
    world.buySeasonPass(alice);

    // Buy season pass
    startGasReport("buy season pass");
    world.buySeasonPass{ value: value }(alice);
    endGasReport();

    assertEq(Balances.get(tableId, alice), 1);

    // Attempt to buy season pass twice
    vm.expectRevert("this account already has a season pass");
    world.buySeasonPass{ value: value }(alice);

    assertEq(Balances.get(tableId, alice), 1);

    // Attempt to transfer season pass
    vm.expectRevert("this token is non-transferrable");
    IERC721(token).transferFrom(alice, bob, 0);

    // Attempt to buy season pass after a sale, without enough value
    if (SeasonPassConfig.getMultiplier() > 100) {
      vm.expectRevert("you must pay enough");
      world.buySeasonPass{ value: value }(bob);
    }

    // Buy season pass with multiplied value
    value = (value * SEASON_PASS_PURCHASE_MULTIPLIER_PERCENT) / 100;
    world.buySeasonPass{ value: value }(bob);

    uint256 secondsSinceLastSale = 200;
    vm.warp(block.timestamp + secondsSinceLastSale);

    value = (value * SEASON_PASS_PURCHASE_MULTIPLIER_PERCENT) / 100;
    value = value - (SEASON_PASS_PRICE_DECREASE_PER_SECOND * secondsSinceLastSale);
    world.buySeasonPass{ value: value }(eve);

    vm.stopPrank();
  }

  function testCreateSeasonPass() public {}

  function _createMatchSeasonPass(
    bytes32 matchEntity,
    ResourceId systemId,
    uint256 entranceFee,
    uint256[] memory rewardPercentages
  ) public {
    vm.startPrank(alice);

    // Create a gated match without season pass
    bytes32 firstMatchInWindow = findFirstMatchInWindow();
    vm.expectRevert("caller does not have the season pass");
    world.createMatchSeasonPass(
      "match",
      firstMatchInWindow,
      matchEntity,
      LEVEL_ID,
      systemId,
      entranceFee,
      rewardPercentages
    );

    // Attempt to mint season pass without sending value
    vm.expectRevert("you must pay enough");
    world.buySeasonPass(alice);

    // Mint season pass
    world.buySeasonPass{ value: calculateCurrentPrice() }(alice);

    // Create a private match with season pass
    startGasReport("create public match with season pass");
    world.createMatchSeasonPass(
      "match",
      firstMatchInWindow,
      matchEntity,
      LEVEL_ID,
      systemId,
      entranceFee,
      rewardPercentages
    );
    endGasReport();

    vm.stopPrank();
  }

  function testCreateMatchSeasonPass() public {
    bytes32 matchEntity;
    ResourceId systemId;
    uint256 entranceFee = 100;
    uint256[] memory rewardPercentages = new uint256[](1);
    rewardPercentages[0] = 100;

    _createMatchSeasonPass(matchEntity, systemId, entranceFee, rewardPercentages);
  }

  function testCanCreateAMatchWithNoEntranceFee() public {
    bytes32 matchEntity;
    ResourceId systemId;
    uint256 entranceFee = 0;

    uint256[] memory rewardPercentages = new uint256[](0);
    _createMatchSeasonPass(matchEntity, systemId, entranceFee, rewardPercentages);
  }

  function testMatchRewardCalculation() public {
    prankAdmin();
    SkyPoolConfig.setWindow(10); // small window for tests
    SkyPoolConfig.setCost(150); // rewards are based on cost, so if cost is 0, rewards are 0

    // manually set the reward distribution for a 0 player map
    // only for the debug level in tests
    uint256[] memory matchRewardPercentages = new uint256[](4);
    matchRewardPercentages[0] = 55;
    matchRewardPercentages[1] = 35;
    matchRewardPercentages[2] = 10;
    matchRewardPercentages[3] = 0;
    MatchRewardPercentages.set(0, matchRewardPercentages);
    vm.stopPrank();

    vm.warp(block.timestamp + 1000);

    // Transfer tokens to bob
    vm.startPrank(worldAddress);
    IERC20(SkyPoolConfig.getOrbToken()).transfer(bob, 10_000 ether);
    vm.stopPrank();

    vm.startPrank(bob);

    createPublicMatch(world, "debug");

    vm.warp(block.timestamp + 200);
    bytes32 matchInsideWindow = createPublicMatch(world, "debug");

    bytes32 userCreatedMatch = keccak256("matchywatchy");
    world.createMatch("match", matchInsideWindow, userCreatedMatch, "debug");
    vm.stopPrank();

    uint256 totalReward = MatchSky.getReward(userCreatedMatch);

    // Has full rewards
    assertEq(MatchReward.getValue(userCreatedMatch, 0), (totalReward * 55) / 100);
    assertEq(MatchReward.getValue(userCreatedMatch, 1), (totalReward * 35) / 100);
    assertEq(MatchReward.getValue(userCreatedMatch, 2), (totalReward * 10) / 100);
    assertEq(MatchReward.getValue(userCreatedMatch, 3), 0);
  }

  /**
   * It is possible that during times of mass match creation
   * players will find it hard to find the correct first match
   * in the reward window. This is because the window is constantly
   * shifting forward as time passes, and the match they claim is
   * first might not be in the reward window by the time their tx
   * resolves. This test ensures our MatchSystem is resillient to
   * this by checking 3 subsequent matches after the claimed match
   * in case of failure.
   */
  function testMatchCreationWithFuzzyMatchFinding() public {
    prankAdmin();
    SkyPoolConfig.setWindow(10); // small window for tests

    bytes32 oldestMatch = createPublicMatch(world, "debug");

    for (uint256 i; i < 12; i++) {
      vm.warp(block.timestamp + 1);
      createPublicMatch(world, "debug");
    }

    SkyPoolConfig.setCost(150); // rewards are based on cost, so if cost is 0, rewards are 0

    vm.stopPrank();

    // Transfer tokens to bob
    vm.startPrank(worldAddress);
    IERC20(SkyPoolConfig.getOrbToken()).transfer(bob, 10_000 ether);
    vm.stopPrank();

    vm.startPrank(bob);

    bytes32 userCreatedMatch = keccak256("matchywatchy2");
    world.createMatch("match", oldestMatch, userCreatedMatch, "debug");

    // test the case where a user claims a match far into the window
    createPublicMatch(world, "debug");
    createPublicMatch(world, "debug");

    vm.expectRevert();
    world.createMatch("match", userCreatedMatch, keccak256("matchywatchy3"), "debug");
    vm.stopPrank();
  }

  /**
   * Test the full flow of a match with entrance fee rewards
   */
  function testAllMatchRewards() public {
    bytes32 matchEntity;
    ResourceId systemId;
    uint256 entranceFee = 100 ether;
    uint256[] memory rewardPercentages = new uint256[](3);
    rewardPercentages[0] = 70;
    rewardPercentages[1] = 20;
    rewardPercentages[2] = 10;

    bytes32 firstMatchInWindow = findFirstMatchInWindow();
    bytes32 player = bytes32(0);

    prankAdmin();
    SkyPoolConfig.setCost(COST);
    OwnedBy.set(matchEntity, player, addressToEntity(bob));

    createLevelIndex(LEVEL_ID, 0, SpawnSettlementTemplateId, 0, 0);
    createLevelIndex(LEVEL_ID, 1, SpawnSettlementTemplateId, 0, 1);

    // mint orbs to players to cover entrance fees
    IERC20Mintable token = IERC20Mintable(SkyPoolConfig.getOrbToken());
    token.mint(alice, entranceFee + COST);
    token.mint(bob, 100 ether);

    vm.stopPrank();

    vm.startPrank(alice);

    world.buySeasonPass{ value: calculateCurrentPrice() }(alice);

    // Create a match
    world.createMatchSeasonPass(
      "match",
      firstMatchInWindow,
      matchEntity,
      LEVEL_ID,
      systemId,
      entranceFee,
      rewardPercentages
    );

    bytes32 alicePlayer = world.register(matchEntity, 0, HalberdierTemplateId);
    vm.stopPrank();

    vm.startPrank(bob);
    bytes32 bobPlayer = world.register(matchEntity, 1, HalberdierTemplateId);
    vm.stopPrank();

    // escrow contract shoudl have default rewards + entrance fee * number of players
    // highest rewards is 300
    assertEq(
      token.balanceOf(MatchConfig.getEscrowContract(matchEntity)),
      500 ether,
      "incorrect escrow contract balance"
    );

    prankAdmin();
    // normally match ranking is set during Combat when a SpawnSettlement is destroyed
    bytes32[] memory rankings = new bytes32[](2);
    rankings[0] = alicePlayer;
    rankings[1] = bobPlayer;
    MatchRanking.set(matchEntity, rankings);
    vm.stopPrank();

    vm.startPrank(worldAddress);
    dispenseRewards(matchEntity);
    vm.stopPrank();

    assertEq(token.balanceOf(alice), 460 ether, "winner/creator incorrect balance");
    assertEq(token.balanceOf(bob), 40 ether, "second place incorrect balance");
    assertEq(
      token.balanceOf(MatchConfig.getEscrowContract(matchEntity)),
      0,
      "escrow contract not empty after match completion"
    );
  }

  function testCreateMatchSkyKey() public {
    bytes32 matchEntity;
    ResourceId systemId;
    uint256 entranceFee = 100;
    uint256[] memory rewardPercentages = new uint256[](1);
    rewardPercentages[0] = 100;

    bytes32 firstMatchInWindow = findFirstMatchInWindow();

    vm.startPrank(alice);
    vm.expectRevert("caller does not have the sky key");
    world.createMatchSkyKey(
      "match",
      firstMatchInWindow,
      matchEntity,
      LEVEL_ID,
      systemId,
      entranceFee,
      rewardPercentages,
      0
    );
    vm.stopPrank();

    prankAdmin();
    SkyPoolConfig.setCost(100 ether);

    startGasReport("create public match with sky key");
    world.createMatchSkyKey(
      "match",
      firstMatchInWindow,
      matchEntity,
      LEVEL_ID,
      systemId,
      entranceFee,
      rewardPercentages,
      0
    );
    endGasReport();
    vm.stopPrank();
  }

  function testSenderHasNoSkyKey() public {
    bytes32 matchEntity;
    ResourceId systemId;
    uint256 entranceFee = 100;
    uint256[] memory rewardPercentages = new uint256[](1);
    rewardPercentages[0] = 100;

    bytes32 firstMatchInWindow = findFirstMatchInWindow();

    vm.startPrank(alice);
    vm.expectRevert("caller does not have the sky key");
    world.createMatchSkyKey(
      "match",
      firstMatchInWindow,
      matchEntity,
      LEVEL_ID,
      systemId,
      entranceFee,
      rewardPercentages,
      0
    );
    vm.stopPrank();
  }
}
