// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { BaseTest, createPublicMatch } from "./BaseTest.sol";

import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { HeroInRotation, HeroInSeasonPassRotation, MatchConfig, LevelTemplates, Player, SpawnPoint, Charger, OwnedBy, LastAction, Name, SpawnReservedBy } from "../src/codegen/index.sol";

import { SpawnSettlementTemplateId, GolemTemplateId } from "../src/codegen/Templates.sol";

bytes32 constant levelId = "debug";

contract PlayerRegisterSystemTest is BaseTest, GasReporter {
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
    bytes32 player = world.register(matchEntity, 0, GolemTemplateId);
    endGasReport();
    vm.stopPrank();

    assertEq(Player.get(matchEntity, player), 1, "did not set Player table");
  }

  function testNotASpawnPoint() public {
    setupRegister();

    vm.startPrank(alice);
    vm.expectRevert("level entity is not a spawn");
    world.register(matchEntity, 2, GolemTemplateId);
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
    HeroInRotation.set(GolemTemplateId, false);
    vm.stopPrank();

    vm.startPrank(alice);
    vm.expectRevert("invalid hero choice");
    world.register(matchEntity, 0, GolemTemplateId);
    vm.stopPrank();
  }

  function testHasSeasonPassNonRotationHero() public {
    setupRegister();

    prankAdmin();
    HeroInSeasonPassRotation.set(GolemTemplateId, false);
    vm.stopPrank();

    vm.startPrank(alice);
    bytes32 player = world.register(matchEntity, 0, GolemTemplateId);
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
    world.register(matchEntity, 0, GolemTemplateId);
    vm.stopPrank();
  }
}
