// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { SkyStrifeTest, createPublicMatch } from "./SkyStrifeTest.sol";

import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { HeroInRotation, HeroInSeasonPassRotation, MatchConfig, LevelTemplates, Player, SpawnPoint, Charger, OwnedBy, LastAction, Name, SpawnReservedBy } from "../src/codegen/index.sol";

import { SpawnSettlementTemplateId, HalberdierTemplateId } from "../src/codegen/Templates.sol";

bytes32 constant levelId = "debug";

contract PlayerRegisterSystemTest is SkyStrifeTest, GasReporter {
  bytes32 matchEntity;

  function setupRegister() private {
    prankAdmin();
    matchEntity = createPublicMatch(world, levelId);
    bytes32[] memory templateIds = new bytes32[](3);
    templateIds[0] = SpawnSettlementTemplateId;
    templateIds[1] = SpawnSettlementTemplateId;
    LevelTemplates.set(levelId, templateIds);
    vm.stopPrank();
  }

  function testRegister() public {
    setupRegister();

    vm.startPrank(alice);
    startGasReport("Register for a match");
    bytes32 player = world.register(matchEntity, 0, HalberdierTemplateId);
    endGasReport();
    vm.stopPrank();

    assertEq(Player.get(matchEntity, player), 1, "did not set Player table");
  }

  function testNotASpawnPoint() public {
    setupRegister();

    vm.startPrank(alice);
    vm.expectRevert("level entity is not a spawn");
    world.register(matchEntity, 2, HalberdierTemplateId);
    vm.stopPrank();
  }

  function testNotAHero() public {
    setupRegister();

    vm.startPrank(alice);
    vm.expectRevert("invalid hero choice");
    world.register(matchEntity, 0, SpawnSettlementTemplateId);
    vm.stopPrank();
  }

  function testNotInRotation() public {
    setupRegister();

    prankAdmin();
    HeroInRotation.set(HalberdierTemplateId, false);
    vm.stopPrank();

    vm.startPrank(alice);
    vm.expectRevert("invalid hero choice");
    world.register(matchEntity, 0, HalberdierTemplateId);
    vm.stopPrank();
  }

  function testHasSeasonPassNonRotationHero() public {
    setupRegister();

    prankAdmin();
    HeroInSeasonPassRotation.set(HalberdierTemplateId, false);
    vm.stopPrank();

    vm.startPrank(alice);
    bytes32 player = world.register(matchEntity, 0, HalberdierTemplateId);
    vm.stopPrank();

    assertEq(Player.get(matchEntity, player), 1, "did not set Player table");
  }

  function testDuplicateName() public {
    setupRegister();

    vm.startPrank(alice);
    world.setName("alice");
    vm.stopPrank();

    vm.startPrank(address(bob));
    vm.expectRevert("name already registered");
    world.setName("alice");
    vm.stopPrank();
  }

  function testCannotRegisterBeforeMatchRegistrationTime() public {
    setupRegister();

    prankAdmin();
    MatchConfig.setRegistrationTime(matchEntity, block.timestamp + 100);
    vm.stopPrank();

    vm.startPrank(alice);

    vm.expectRevert("registration not open");
    world.register(matchEntity, 0, HalberdierTemplateId);
    vm.stopPrank();
  }

  function testCannotRegisterTwice() public {
    setupRegister();
    setupRegister();

    vm.startPrank(alice);

    world.register(matchEntity, 0, HalberdierTemplateId);

    vm.expectRevert("this account has already registered for the match");
    world.register(matchEntity, 1, HalberdierTemplateId);

    vm.stopPrank();
  }
}
