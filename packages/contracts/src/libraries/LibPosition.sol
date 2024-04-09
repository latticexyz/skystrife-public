// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.24;

import { Position, PositionData, EntitiesAtPosition } from "../codegen/index.sol";
import { ArrayLib } from "@latticexyz/world-modules/src/modules/utils/ArrayLib.sol";

using ArrayLib for bytes32[];

function _popEntityFromPosition(bytes32 matchEntity, bytes32 entity) {
  PositionData memory previousPosition = Position.get(matchEntity, entity);
  bytes32[] memory entitiesAtPreviousPosition = EntitiesAtPosition
    .get(matchEntity, previousPosition.x, previousPosition.y)
    .filter(entity);
  if (entitiesAtPreviousPosition.length > 0) {
    EntitiesAtPosition.set(matchEntity, previousPosition.x, previousPosition.y, entitiesAtPreviousPosition);
  } else {
    EntitiesAtPosition.deleteRecord(matchEntity, previousPosition.x, previousPosition.y);
  }
}

function setPosition(bytes32 matchEntity, bytes32 entity, PositionData memory position) {
  _popEntityFromPosition(matchEntity, entity);
  Position.set(matchEntity, entity, position);
  EntitiesAtPosition.push(matchEntity, position.x, position.y, entity);
}

function removePosition(bytes32 matchEntity, bytes32 entity) {
  _popEntityFromPosition(matchEntity, entity);
  Position.deleteRecord(matchEntity, entity);
}
