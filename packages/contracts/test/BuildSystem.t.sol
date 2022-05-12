// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { BaseTest } from "./BaseTest.sol";

import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { spawnTemplateAt } from "../src/libraries/LibTemplate.sol";

import { Factory, FactoryData, OwnedBy, Position, PositionData, UnitType, Stamina } from "../src/codegen/index.sol";
import { SwordsmanTemplateId } from "../src/codegen/Templates.sol";

import { UnitTypes } from "../src/codegen/common.sol";

import { createPlayerEntity } from "../src/libraries/LibPlayer.sol";
import { setPosition } from "../src/libraries/LibPosition.sol";

contract BuildSystemTest is BaseTest, GasReporter {
  bytes32 player;
  bytes32 factory = keccak256("factory");
  bytes32 prototypeId = SwordsmanTemplateId;
  PositionData targetPosition;

  function setupFactory() public {
    prankAdmin();
    player = createPlayerEntity(testMatch, alice);

    bytes32[] memory prototypeIds = new bytes32[](1);
    prototypeIds[0] = prototypeId;

    int32[] memory staminaCosts = new int32[](1);
    staminaCosts[0] = 1000;

    Factory.set(testMatch, factory, FactoryData({ prototypeIds: prototypeIds, staminaCosts: staminaCosts }));
    OwnedBy.set(testMatch, factory, player);
    setPosition(testMatch, factory, PositionData({ x: 10, y: 10 }));

    targetPosition = PositionData({ x: 11, y: 10 });

    vm.stopPrank();
  }

  function testBuildUnit() public {
    setupFactory();

    vm.startPrank(alice);
    startGasReport("Build unit");
    bytes32 unit = world.build(testMatch, factory, prototypeId, targetPosition);
    endGasReport();
    vm.stopPrank();

    assertEq(OwnedBy.get(testMatch, unit), player, "unit not owned by player");
    assertEq(Position.get(testMatch, unit).x, targetPosition.x, "unit not at target position");
    assertEq(Position.get(testMatch, unit).y, targetPosition.y, "unit not at target position");

    // spends player stamina
    assertEq(Stamina.get(testMatch, player), 0, "player stamina not spent");
  }

  function testNotAFactory() public {
    setupFactory();

    prankAdmin();
    Factory.deleteRecord(testMatch, factory);
    vm.stopPrank();

    vm.startPrank(alice);
    vm.expectRevert("this factory does not have this template");
    world.build(testMatch, factory, prototypeId, targetPosition);
    vm.stopPrank();
  }

  function testNotAbleToBuildPrototype() public {
    setupFactory();

    vm.startPrank(alice);
    vm.expectRevert("this factory does not have this template");
    world.build(testMatch, factory, keccak256("not a prototype"), targetPosition);
    vm.stopPrank();
  }

  // player stamina = gold
  function testPlayerDoesNotHaveEnoughStamina() public {
    setupFactory();

    prankAdmin();
    Stamina.set(testMatch, player, 0);
    vm.stopPrank();

    vm.startPrank(alice);
    vm.expectRevert("not enough stamina");
    world.build(testMatch, factory, prototypeId, targetPosition);
    vm.stopPrank();
  }

  function testPlayerDoesNotOwnFactory() public {
    setupFactory();

    prankAdmin();
    OwnedBy.set(testMatch, factory, keccak256("not player"));
    vm.stopPrank();

    vm.startPrank(alice);
    vm.expectRevert("you do not own this factory");
    world.build(testMatch, factory, prototypeId, targetPosition);
    vm.stopPrank();
  }

  function testTargetPositionNotAdjacent() public {
    setupFactory();

    vm.startPrank(alice);
    vm.expectRevert("target position is not adjacent");
    world.build(testMatch, factory, prototypeId, PositionData({ x: 20, y: 20 }));
    vm.stopPrank();
  }

  function testEntityBlockingTargetPosition() public {
    setupFactory();

    prankAdmin();
    spawnTemplateAt(testMatch, SwordsmanTemplateId, player, PositionData({ x: 11, y: 10 }));
    vm.stopPrank();

    vm.startPrank(alice);
    vm.expectRevert("entity blocking position");
    world.build(testMatch, factory, prototypeId, targetPosition);
    vm.stopPrank();
  }
}
