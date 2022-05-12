// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";
import { PackedCounter } from "@latticexyz/store/src/PackedCounter.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { LevelTemplates, LevelTemplatesIndex, LevelPosition, LevelPositionIndex } from "../../codegen/index.sol";

function createLevelIndex(bytes32 levelId, uint256 index, bytes32 templateId, int32 x, int32 y) {
  LevelTemplates.push(levelId, templateId);
  LevelTemplatesIndex.push(levelId, templateId, index);

  LevelPosition.set(levelId, index, x, y);
  LevelPositionIndex.push(levelId, x, y, index);
}
