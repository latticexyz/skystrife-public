// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { createLevelIndex } from "../libraries/levels/createLevel.sol";
import { LevelTemplates, Position, PositionTableId, PositionData } from "../codegen/index.sol";
import { addressToEntity, isAdmin } from "../libraries/LibUtils.sol";

contract LevelUploadSystem is System {
  function uploadLevel(bytes32 levelId, bytes32[] memory templateIds, int32[] memory xs, int32[] memory ys) public {
    require(isAdmin(addressToEntity(_msgSender())), "admin only system");

    uint256 size = LevelTemplates.length(levelId);
    for (uint256 i; i < templateIds.length; i++) {
      uint256 index = size + i;

      createLevelIndex(levelId, index, templateIds[i], xs[i], ys[i]);
    }
  }
}
