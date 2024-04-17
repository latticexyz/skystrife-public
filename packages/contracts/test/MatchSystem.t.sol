// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
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

import { MatchIndex, MatchConfig, MatchConfigData, MatchRanking, LevelTemplatesIndex, OwnedBy, SkyPoolConfig, SeasonPassConfig, SeasonPassLastSaleAt, MatchSky, MatchReward, LastMatchIndex, MatchRewardPercentages, MatchesPerDay } from "../src/codegen/index.sol";

import { SeasonPassSystem, calculateCurrentPrice } from "../src/systems/SeasonPassSystem.sol";

import { SEASON_PASS_STARTING_PRICE, SEASON_PASS_PURCHASE_MULTIPLIER_PERCENT, SEASON_PASS_PRICE_DECREASE_PER_SECOND } from "../script/PostDeploy.s.sol";

uint256 constant COST = 100;
uint256 constant BALANCE = 250;
bytes32 constant LEVEL_ID = "debug";

contract MatchSystemTest is SkyStrifeTest, GasReporter {
  using WorldResourceIdInstance for ResourceId;
  ResourceId accessSystemId;

  function testCreateMatch() public {
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

    uint256 day = block.timestamp / 1 days;
    uint256 matchesToday = MatchesPerDay.get(day);

    startGasReport("create public match");
    world.createMatch("match", firstMatchInWindow, matchEntity, LEVEL_ID);
    endGasReport();
    vm.stopPrank();

    // Check creators balance was deducted
    assertEq(Balances.get(tableId, alice), BALANCE - COST);

    // Check match was created properly
    assertEq(MatchConfig.get(matchEntity).startTime, 0);
    assertEq(MatchConfig.get(matchEntity).turnLength, 15);
    assertEq(MatchConfig.get(matchEntity).levelId, LEVEL_ID);
    assertEq(MatchIndex.get(matchEntity), 2);

    assertEq(MatchesPerDay.get(day), matchesToday + 1);
  }

  function testMatchPerDayHardCap() public {
    uint256 today = block.timestamp / 1 days;

    prankAdmin();
    MatchesPerDay.set(today, 1001);
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
    uint256 entranceFee = 100;
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
    token.mint(bob, 100);

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
    assertEq(token.balanceOf(MatchConfig.getEscrowContract(matchEntity)), 700, "incorrect escrow contract balance");

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

    assertEq(token.balanceOf(alice), 660, "winner/creator incorrect balance");
    assertEq(token.balanceOf(bob), 40, "second place incorrect balance");
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
