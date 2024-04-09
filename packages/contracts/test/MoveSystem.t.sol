// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { SkyStrifeTest } from "./SkyStrifeTest.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { MatchConfig, Position, PositionData, Movable, OwnedBy, Untraversable, Combat, CombatData, LastAction } from "../src/codegen/index.sol";
import { GrassTemplateId } from "../src/codegen/Templates.sol";
import { CombatArchetypes } from "base/codegen/common.sol";

import { createPlayerEntity } from "../src/libraries/LibPlayer.sol";
import { createLevelIndex } from "../src/libraries/levels/createLevel.sol";
import { createMatchEntity } from "../src/createMatchEntity.sol";
import { setPosition } from "../src/libraries/LibPosition.sol";

bytes32 constant LEVEL_ID = "testLevel";

contract MoveSystemTest is SkyStrifeTest, GasReporter {
  bytes32 player;
  bytes32 unit;

  function setupMove() public {
    prankAdmin();
    player = createPlayerEntity(testMatch, alice);

    // 4x4 grid
    PositionData[] memory terrainLocations = new PositionData[](16);
    terrainLocations[0] = PositionData(0, 0);
    terrainLocations[1] = PositionData(0, 1);
    terrainLocations[2] = PositionData(0, 2);
    terrainLocations[3] = PositionData(0, 3);
    terrainLocations[4] = PositionData(1, 0);
    terrainLocations[5] = PositionData(1, 1);
    terrainLocations[6] = PositionData(1, 2);
    terrainLocations[7] = PositionData(1, 3);
    terrainLocations[8] = PositionData(2, 0);
    terrainLocations[9] = PositionData(2, 1);
    terrainLocations[10] = PositionData(2, 2);
    terrainLocations[11] = PositionData(2, 3);
    terrainLocations[12] = PositionData(3, 0);
    terrainLocations[13] = PositionData(3, 1);
    terrainLocations[14] = PositionData(3, 2);
    terrainLocations[15] = PositionData(3, 3);

    // Set level data
    MatchConfig.setLevelId(testMatch, LEVEL_ID);
    for (uint256 i = 0; i < terrainLocations.length; i++) {
      createLevelIndex(LEVEL_ID, i, GrassTemplateId, terrainLocations[i].x, terrainLocations[i].y);
    }

    unit = createMatchEntity(testMatch);
    setPosition(testMatch, unit, PositionData(0, 0));
    Movable.set(testMatch, unit, 4_000);
    OwnedBy.set(testMatch, unit, player);

    vm.stopPrank();

    // Pass time beyond units last actions timestamps
    vm.warp(block.timestamp + 100);
  }

  function runSystem(PositionData[] memory path) private prank(alice) {
    world.move(testMatch, unit, path);
  }

  function testMoveOneTile() public {
    setupMove();

    PositionData[] memory path = new PositionData[](1);
    path[0] = PositionData(0, 1);

    vm.startPrank(alice);
    startGasReport("Move unit 1 tile");
    world.move(testMatch, unit, path);
    endGasReport();

    PositionData memory position = Position.get(testMatch, unit);
    assertEq(position.x, 0, "x should be 0");
    assertEq(position.y, 1, "y should be 1");
  }

  function testMoveTwoTiles() public {
    setupMove();

    PositionData[] memory path = new PositionData[](2);
    path[0] = PositionData(0, 1);
    path[1] = PositionData(0, 2);

    vm.startPrank(alice);
    startGasReport("Move unit 2 tiles");
    world.move(testMatch, unit, path);
    endGasReport();

    PositionData memory position = Position.get(testMatch, unit);
    assertEq(position.x, 0, "x should be 0");
    assertEq(position.y, 2, "y should be 2");
  }

  function testMoveThreeTiles() public {
    setupMove();

    PositionData[] memory path = new PositionData[](3);
    path[0] = PositionData(0, 1);
    path[1] = PositionData(0, 2);
    path[2] = PositionData(0, 3);

    vm.startPrank(alice);
    startGasReport("Move unit 3 tiles");
    world.move(testMatch, unit, path);
    endGasReport();

    PositionData memory position = Position.get(testMatch, unit);
    assertEq(position.x, 0, "x should be 0");
    assertEq(position.y, 3, "y should be 3");
  }

  function testMovementSetsLastAction() public {
    setupMove();

    PositionData[] memory path = new PositionData[](2);
    path[0] = PositionData(0, 1);
    path[1] = PositionData(0, 2);

    runSystem(path);

    uint256 lastAction = LastAction.get(testMatch, unit);
    assertEq(lastAction, block.timestamp, "last action should be the block timestamp");
  }

  function testMoveInvalidPath() public {
    setupMove();

    PositionData[] memory path = new PositionData[](2);
    path[0] = PositionData(0, 1);
    path[1] = PositionData(0, 3);

    vm.expectRevert("invalid path");
    runSystem(path);
  }

  function testMovingTooFar() public {
    setupMove();

    PositionData[] memory path = new PositionData[](5);
    path[0] = PositionData(0, 1);
    path[1] = PositionData(1, 1);
    path[2] = PositionData(2, 1);
    path[3] = PositionData(2, 2);
    path[4] = PositionData(2, 3);

    vm.expectRevert("not enough move speed");
    runSystem(path);
  }

  function testEntityBlockingPath() public {
    setupMove();

    prankAdmin();
    PositionData memory position = PositionData(0, 1);
    bytes32 entity = createMatchEntity(testMatch);
    setPosition(testMatch, entity, position);
    Untraversable.set(testMatch, entity, true);
    vm.stopPrank();

    PositionData[] memory path = new PositionData[](2);
    path[0] = PositionData(0, 1);
    path[1] = PositionData(0, 2);

    vm.expectRevert("cannot move through enemies");
    runSystem(path);
  }

  function testMoveThroughFriendlyUnits() public {
    setupMove();

    prankAdmin();
    bytes32 entity = createMatchEntity(testMatch);
    OwnedBy.set(testMatch, entity, player);
    Untraversable.set(testMatch, entity, true);
    vm.stopPrank();

    PositionData[] memory path = new PositionData[](2);
    path[0] = PositionData(0, 1);
    path[1] = PositionData(0, 2);

    runSystem(path);

    PositionData memory position = Position.get(testMatch, unit);
    assertEq(position.x, 0, "x should be 0");
    assertEq(position.y, 2, "y should be 2");
  }

  function testMoveAndAttack() public {
    setupMove();

    prankAdmin();
    Combat.set(
      testMatch,
      unit,
      CombatData({
        health: 100_000,
        maxHealth: 100_000,
        strength: 20_000,
        counterStrength: 100,
        minRange: 1,
        maxRange: 1,
        archetype: CombatArchetypes.Unknown
      })
    );

    bytes32 enemy = createMatchEntity(testMatch);
    setPosition(testMatch, enemy, PositionData(0, 3));
    Combat.set(
      testMatch,
      enemy,
      CombatData({
        health: 100_000,
        maxHealth: 100_000,
        strength: 20_000,
        counterStrength: 100,
        minRange: 1,
        maxRange: 1,
        archetype: CombatArchetypes.Unknown
      })
    );
    vm.stopPrank();

    PositionData[] memory path = new PositionData[](2);
    path[0] = PositionData(0, 1);
    path[1] = PositionData(0, 2);

    vm.startPrank(alice);
    startGasReport("Move and attack unit");
    world.moveAndAttack(testMatch, unit, path, enemy);
    endGasReport();
    vm.stopPrank();

    PositionData memory position = Position.get(testMatch, unit);
    assertEq(position.x, 0, "x should be 0");
    assertEq(position.y, 2, "y should be 2");

    CombatData memory combat = Combat.get(testMatch, enemy);
    assertEq(combat.health, 80_000, "enemy was not attacked");
  }
}
