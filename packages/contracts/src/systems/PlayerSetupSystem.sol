// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { System } from "@latticexyz/world/src/System.sol";

import { SkyPoolConfig, MatchAccessControl, MatchSweepstake, LevelTemplates, MatchConfig, Player, SpawnPoint, SpawnReservedBy, Position, PositionTableId, PositionData, MapCenterTableId, PlayerTableId, MatchSpawnPoints } from "../codegen/index.sol";
import { MatchAccessControl, LevelTemplates, MatchConfig, Player, SpawnPoint, SpawnReservedBy, Position, PositionTableId, PositionData, MapCenterTableId, PlayerTableId, MatchSpawnPoints, HeroInRotation, HeroInSeasonPassRotation } from "../codegen/index.sol";
import { SpawnSettlementTemplateId } from "../codegen/Templates.sol";

import { createMatchEntity } from "../createMatchEntity.sol";
import { instantiateLevelEntity } from "../libraries/levels/instantiateLevel.sol";
import { addressToEntity, entityToKeyTuple } from "../libraries/LibUtils.sol";
import { spawnStarter, startMatchIfAllRegistered } from "../libraries/LibMatch.sol";
import { createPlayerEntity, spawnPlayer } from "../libraries/LibPlayer.sol";

contract PlayerSetupSystem is System {
  function setup(bytes32 matchEntity, uint256 spawnIndex, bytes32 heroChoice) public returns (bytes32 player) {
    bytes32 levelId = MatchConfig.getLevelId(matchEntity);

    // Create the players spawn point
    bytes32 spawnPoint = createMatchEntity(matchEntity);
    instantiateLevelEntity(levelId, spawnIndex, entityToKeyTuple(matchEntity, spawnPoint));
    MatchSpawnPoints.push(matchEntity, spawnPoint);

    // Initialise the player
    player = createPlayerEntity(matchEntity, _msgSender());

    // Mark the spawn point as reserved
    SpawnReservedBy.set(matchEntity, spawnIndex, player);

    spawnPlayer(matchEntity, player, spawnPoint);

    // Create a starting unit adjacent to the spawn
    spawnStarter(matchEntity, heroChoice, player, Position.get(matchEntity, spawnPoint));

    startMatchIfAllRegistered(matchEntity);
  }
}
