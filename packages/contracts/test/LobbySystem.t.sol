// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { SkyStrifeTest, createPublicMatch } from "./SkyStrifeTest.sol";

import { LevelTemplates, LevelTemplatesIndex, OwnedBy, PlayerReady, SpawnPoint, Position, PositionData, Charger, MatchReady, SpawnReservedBy, MatchConfigData, MatchConfig } from "../src/codegen/index.sol";
import { SpawnSettlementTemplateId, HalberdierTemplateId } from "../src/codegen/Templates.sol";

import { FORCE_START_WAIT } from "../src/libraries/LibMatch.sol";

import { createPlayerEntity } from "../src/libraries/LibPlayer.sol";

contract LobbySystemTest is SkyStrifeTest {
  bytes32 player;
  bytes32 player2;

  bytes32 matchEntity;

  bytes32 levelId = "LEVEL";

  function lobbySetup() public {
    prankAdmin();

    matchEntity = createPublicMatch(world, "debug");
    bytes32[] memory templateIds = new bytes32[](2);
    templateIds[0] = SpawnSettlementTemplateId;
    templateIds[1] = SpawnSettlementTemplateId;
    LevelTemplates.set(levelId, templateIds);
    LevelTemplatesIndex.push(levelId, SpawnSettlementTemplateId, 0);
    LevelTemplatesIndex.push(levelId, SpawnSettlementTemplateId, 1);
    MatchReady.set(matchEntity, block.timestamp);
    MatchConfig.setLevelId(matchEntity, levelId);
    MatchConfig.setStartTime(matchEntity, 0);

    vm.stopPrank();

    vm.startPrank(alice);
    player = world.register(matchEntity, 0, HalberdierTemplateId);
    vm.stopPrank();

    vm.startPrank(bob);
    player2 = world.register(matchEntity, 1, HalberdierTemplateId);
    world.toggleReady(matchEntity);
    vm.stopPrank();
  }

  function testForceStartMatchWhenFull() public {
    // in case players do not ready up and close the tab
    lobbySetup();
    assertEq(MatchConfig.getStartTime(matchEntity), block.timestamp + FORCE_START_WAIT, "match start time was not set");
  }

  function testToggleReady() public {
    lobbySetup();

    vm.startPrank(alice);
    world.toggleReady(matchEntity);
    vm.stopPrank();

    assertTrue(PlayerReady.get(matchEntity, player) > 0, "ready not set");

    vm.startPrank(alice);
    world.toggleReady(matchEntity);
    vm.stopPrank();

    assertTrue(PlayerReady.get(matchEntity, player) == 0, "ready not unset");
  }

  function testMatchStart() public {
    lobbySetup();

    vm.startPrank(alice);
    world.toggleReady(matchEntity);
    vm.stopPrank();

    assertEq(MatchConfig.getStartTime(matchEntity), block.timestamp + 5 seconds, "match start time was not set");
  }

  function testDoesNotUseReadyUpsFromOtherMatches() public {
    lobbySetup();

    prankAdmin();
    bytes32 matchEntity2 = createPublicMatch(world, "debug");
    createPlayerEntity(matchEntity2, eve);
    MatchReady.set(matchEntity2, block.timestamp);
    vm.stopPrank();

    // ready from another match
    vm.startPrank(eve);
    world.toggleReady(matchEntity2);
    vm.stopPrank();

    vm.startPrank(bob);
    // unready
    world.toggleReady(matchEntity);
    vm.stopPrank();

    vm.startPrank(alice);
    world.toggleReady(matchEntity);
    vm.stopPrank();

    assertEq(
      MatchConfig.getStartTime(matchEntity),
      block.timestamp + FORCE_START_WAIT,
      "match was started with ready ups from other matches"
    );
  }
}
