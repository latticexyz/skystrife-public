// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { LevelTemplates, LevelTemplatesIndex, LevelPosition, LevelPositionIndex } from "../../codegen/index.sol";

function createLevelIndex(bytes32 levelId, uint256 index, bytes32 templateId, int32 x, int32 y) {
  LevelTemplates.push(levelId, templateId);
  LevelTemplatesIndex.push(levelId, templateId, index);

  LevelPosition.set(levelId, index, x, y);
  LevelPositionIndex.push(levelId, x, y, index);
}
