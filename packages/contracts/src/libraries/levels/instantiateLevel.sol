// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { instantiateTemplate } from "../templates/instantiateTemplate.sol";
import { LevelPosition, LevelPositionData, LevelTemplates, Position } from "../../codegen/index.sol";

/**
 * Create an entity within an instance of `levelId`.
 */
function instantiateLevelEntity(bytes32 levelId, uint256 index, bytes32[] memory keyTuple) {
  // Create a template instance
  instantiateTemplate(LevelTemplates.getItem(levelId, index), keyTuple);

  // Set position override
  LevelPositionData memory levelPosition = LevelPosition.get(levelId, index);

  Position.set(keyTuple[0], keyTuple[1], levelPosition.x, levelPosition.y);
}

/**
 * Create an instance of `levelId`.
 */
function instantiateLevel(bytes32 levelId, bytes32[][] memory keys) {
  uint256 size = LevelTemplates.length(levelId);

  for (uint256 i; i < size; i++) {
    instantiateLevelEntity(levelId, i, keys[i]);
  }
}
