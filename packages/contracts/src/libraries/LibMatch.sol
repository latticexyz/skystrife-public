// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { LevelPosition, LevelPositionData, LevelTemplates, LevelTemplatesIndex, MatchConfig, MatchReady, Player, Name, SpawnPoint, SpawnReservedBy, Position, PositionData, PlayerReady, MatchPlayers } from "../codegen/index.sol";
import { MapCenterMarkerTemplateId, SpawnSettlementTemplateId } from "../codegen/Templates.sol";

import { spawnTemplateAt } from "../libraries/LibTemplate.sol";
import { getLevelSpawnIndices } from "../libraries/LibUtils.sol";

uint256 constant FULL_READY_START_WAIT = 5 seconds;
uint256 constant FORCE_START_WAIT = 2 minutes;

function startMatchIfAllRegistered(bytes32 matchEntity) {
  uint256 copiedTime = MatchReady.get(matchEntity);

  // If the match has finished copying
  if (copiedTime != 0 && block.timestamp >= copiedTime) {
    bytes32 levelId = MatchConfig.getLevelId(matchEntity);
    bytes32[] memory playersInMatch = MatchPlayers.get(matchEntity);

    // If enough players have joined, set the start time
    if (playersInMatch.length == getLevelSpawnIndices(levelId).length) {
      MatchConfig.setStartTime(matchEntity, block.timestamp + FORCE_START_WAIT);
    }
  }
}

function startMatchIfAllReady(bytes32 matchEntity) {
  uint256 copiedTime = MatchReady.get(matchEntity);

  // If the match has finished copying
  if (copiedTime != 0 && block.timestamp >= copiedTime) {
    bytes32 levelId = MatchConfig.getLevelId(matchEntity);

    bytes32[] memory playersInMatch = MatchPlayers.get(matchEntity);
    uint256 numberOfReadys = 0;
    for (uint256 i = 0; i < playersInMatch.length; i++) {
      bytes32 playerEntity = playersInMatch[i];
      if (PlayerReady.get(matchEntity, playerEntity) > 0) {
        numberOfReadys++;
      }
    }

    // If enough players have joined and readied up, set the start time
    if (numberOfReadys == LevelTemplatesIndex.length(levelId, SpawnSettlementTemplateId)) {
      MatchConfig.setStartTime(matchEntity, block.timestamp + FULL_READY_START_WAIT);
    }
  }
}

function findMapCenter(bytes32 matchEntity) view returns (PositionData memory) {
  bytes32 levelId = MatchConfig.getLevelId(matchEntity);

  // If this level has a map center marker, fetch its static position data
  uint256[] memory indices = LevelTemplatesIndex.get(levelId, MapCenterMarkerTemplateId);
  if (indices.length > 0) {
    LevelPositionData memory position = LevelPosition.get(levelId, indices[0]);

    return PositionData({ x: position.x, y: position.y });
  }

  return PositionData({ x: 0, y: 0 });
}

function spawnStarter(bytes32 matchEntity, bytes32 template, bytes32 owner, PositionData memory position) {
  PositionData memory mapCenter = findMapCenter(matchEntity);

  int32 xDiff = position.x - mapCenter.x;
  int32 yDiff = position.y - mapCenter.y;

  if (position.x > 0) {
    position.x = position.x - 1;
  } else if (xDiff < 0) {
    position.x = position.x + 1;
  } else if (yDiff > 0) {
    position.y = position.y - 1;
  } else {
    position.y = position.y + 1;
  }

  spawnTemplateAt(matchEntity, template, owner, PositionData({ x: position.x, y: position.y }));
}
