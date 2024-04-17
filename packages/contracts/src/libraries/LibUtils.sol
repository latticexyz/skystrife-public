// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.24;

import { Position, PositionData, Admin, OwnedBy, Match, MatchConfig, MatchConfigData, SpawnPoint, Player, MatchPlayer, LevelPositionIndex, MatchIndex, MatchIndexToEntity, LevelTemplatesIndex, SkyPoolConfig } from "../codegen/index.sol";
import { SpawnSettlementTemplateId } from "../codegen/Templates.sol";

function isAdmin(bytes32 key) view returns (bool) {
  return Admin.get(key);
}

function min(int32 a, int32 b) pure returns (int32) {
  return a < b ? a : b;
}

function max(int32 a, int32 b) pure returns (int32) {
  return a > b ? a : b;
}

function addressToEntity(address a) pure returns (bytes32) {
  return bytes32(uint256(uint160((a))));
}

function entityToAddress(bytes32 value) pure returns (address) {
  return address(uint160(uint256(value)));
}

function entityToKeyTuple(bytes32 matchEntity, bytes32 entity) pure returns (bytes32[] memory keyTuple) {
  keyTuple = new bytes32[](2);
  keyTuple[0] = matchEntity;
  keyTuple[1] = entity;
}

function playerFromAddress(bytes32 matchEntity, address playerAddress) view returns (bytes32) {
  return MatchPlayer.get(matchEntity, playerAddress);
}

function manhattan(PositionData memory a, PositionData memory b) pure returns (int32) {
  int32 dx = a.x > b.x ? a.x - b.x : b.x - a.x;
  int32 dy = a.y > b.y ? a.y - b.y : b.y - a.y;
  return dx + dy;
}

function getMatch(uint32 matchIndex) view returns (bytes32) {
  return MatchIndexToEntity.get(matchIndex);
}

function matchHasStarted(bytes32 matchEntity) view returns (bool) {
  uint256 startTime = MatchConfig.getStartTime(matchEntity);
  return startTime != 0 && startTime <= block.timestamp;
}

function getOwningPlayer(bytes32 matchEntity, bytes32 entity) view returns (bytes32) {
  if (Player.get(matchEntity, entity) != 0) return entity;
  while (OwnedBy.get(matchEntity, entity) != 0) {
    entity = OwnedBy.get(matchEntity, entity);
    if (Player.get(matchEntity, entity) != 0) return entity;
  }

  return 0;
}

function isOwnedByAddress(bytes32 matchEntity, bytes32 entity, address owner) view returns (bool) {
  bytes32 owningPlayer = getOwningPlayer(matchEntity, entity);
  bytes32 player = playerFromAddress(matchEntity, owner);

  return owningPlayer == player;
}

function isOwnedBy(bytes32 matchEntity, bytes32 entity, bytes32 owner) view returns (bool) {
  if (Admin.get(owner)) return true;
  if (entity == owner) return true;

  while (OwnedBy.get(matchEntity, entity) != 0) {
    entity = OwnedBy.get(matchEntity, entity);
    if (entity == owner) return true;
  }

  return false;
}

/**
 * @notice Get all the indices in `levelId` with the given Position override
 */
function getIndicesAtPosition(bytes32 levelId, PositionData memory position) view returns (uint256[] memory) {
  return LevelPositionIndex.get(levelId, position.x, position.y);
}

function getLevelSpawnIndices(bytes32 levelId) view returns (uint256[] memory) {
  return LevelTemplatesIndex.get(levelId, SpawnSettlementTemplateId);
}
