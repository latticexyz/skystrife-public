// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.24;

import { Bytes } from "@latticexyz/store/src/Bytes.sol";

import { isOwnedByAddress, manhattan, getIndicesAtPosition, entityToAddress } from "./LibUtils.sol";

import { StructureTypes } from "../codegen/common.sol";

import { EntitiesAtPosition, Position, PositionData, MatchConfig, MoveDifficulty, Untraversable, StructureType, TemplateContent, LevelTemplates, ArmorModifier, MoveDifficulty } from "../codegen/index.sol";

function moveIsBlocked(bytes32 matchEntity, bytes32 playerAddress, PositionData[] memory path, uint256 pathIndex) view {
  bytes32[] memory entities = EntitiesAtPosition.get(matchEntity, path[pathIndex].x, path[pathIndex].y);
  for (uint256 i; i < entities.length; i++) {
    bytes32 entity = entities[i];
    if (Untraversable.get(matchEntity, entity)) {
      require(isOwnedByAddress(matchEntity, entity, entityToAddress(playerAddress)), "cannot move through enemies");
      require(StructureType.get(matchEntity, entity) == StructureTypes.Unknown, "cannot move through structures");

      require(pathIndex != path.length - 1, "cannot finish movement on an Untraversable entity");
    }
  }
}

function decodeInt32(bytes memory staticData) pure returns (int32) {
  return int32(uint32(Bytes.getBytes4(staticData, 0)));
}

library LibMove {
  function calculateUsedMoveSpeed(
    bytes32 matchEntity,
    bytes32 levelId,
    bytes32 player,
    PositionData memory position,
    PositionData[] memory path
  ) internal view returns (int32 usedMoveSpeed) {
    for (uint256 i; i < path.length; i++) {
      PositionData memory targetPosition = path[i];
      int32 distance = manhattan(position, targetPosition);
      require(distance <= 1, "invalid path");
      moveIsBlocked(matchEntity, player, path, i);

      int32 movementDifficulty = getMovementDifficultyAtPosition(levelId, targetPosition);
      require(movementDifficulty > 0, "no terrain here");

      usedMoveSpeed += movementDifficulty;
      position = targetPosition;
    }

    return usedMoveSpeed;
  }

  /**
   * @notice Sum the movement difficulty of all the indices in `levelId` with the given `position`.
   */
  function getMovementDifficultyAtPosition(
    bytes32 levelId,
    PositionData memory position
  ) internal view returns (int32 movementDifficulty) {
    uint256[] memory indices = getIndicesAtPosition(levelId, position);

    for (uint256 i; i < indices.length; i++) {
      bytes32 templateId = LevelTemplates.getItem(levelId, indices[i]);
      bytes memory staticData = TemplateContent.getStaticData(templateId, MoveDifficulty._tableId);

      // Manual MUD decoding
      movementDifficulty += decodeInt32(staticData);
    }
  }

  /**
   * @notice Sum the armor modifier of all the indices in `levelId` with the given `position`.
   */
  function getArmorModifierAtPosition(
    bytes32 levelId,
    PositionData memory position
  ) internal view returns (int32 armorModifier) {
    uint256[] memory indices = getIndicesAtPosition(levelId, position);

    for (uint256 i; i < indices.length; i++) {
      bytes32 templateId = LevelTemplates.getItem(levelId, indices[i]);
      bytes memory staticData = TemplateContent.getStaticData(templateId, ArmorModifier._tableId);

      // Manual MUD decoding
      armorModifier += decodeInt32(staticData);
    }
  }
}
