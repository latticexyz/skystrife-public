// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import { System } from "@latticexyz/world/src/System.sol";
import { LevelTemplates } from "../codegen/index.sol";

import { createLevelIndex } from "../libraries/levels/createLevel.sol";
import { skyKeyHolderOnly } from "../libraries/LibSkyPool.sol";

contract LevelUploadSystem is System {
  function uploadLevel(bytes32 levelId, bytes32[] memory templateIds, int32[] memory xs, int32[] memory ys) public {
    skyKeyHolderOnly(_msgSender());

    uint256 size = LevelTemplates.length(levelId);
    for (uint256 i; i < templateIds.length; i++) {
      uint256 index = size + i;

      createLevelIndex(levelId, index, templateIds[i], xs[i], ys[i]);
    }
  }
}
