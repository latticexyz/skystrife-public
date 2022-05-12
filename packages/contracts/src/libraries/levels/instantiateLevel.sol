// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { PackedCounter } from "@latticexyz/store/src/PackedCounter.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { instantiateTemplate } from "../templates/instantiateTemplate.sol";
import { LevelPosition, LevelTemplates, Position } from "../../codegen/index.sol";

/**
 * Create an entity within an instance of `levelId`.
 */
function instantiateLevelEntity(bytes32 levelId, uint256 index, bytes32[] memory keyTuple) {
  // Create a template instance
  instantiateTemplate(LevelTemplates.getItem(levelId, index), keyTuple);

  // Set position override
  (int32 x, int32 y) = LevelPosition.get(levelId, index);

  Position.set(keyTuple[0], keyTuple[1], x, y);
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
