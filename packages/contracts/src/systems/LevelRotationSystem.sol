// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import { System } from "@latticexyz/world/src/System.sol";
import { LevelInStandardRotation, LevelInSeasonPassRotation } from "../codegen/index.sol";
import { addressToEntity, isAdmin } from "../libraries/LibUtils.sol";

contract LevelRotationSystem is System {
  function setRotationStandard(bytes32 levelId, bool inRotation) public {
    require(isAdmin(addressToEntity(_msgSender())), "admin only system");

    LevelInStandardRotation.set(levelId, inRotation);
  }

  function setRotationSeasonPass(bytes32 levelId, bool inRotation) public {
    require(isAdmin(addressToEntity(_msgSender())), "admin only system");

    LevelInSeasonPassRotation.set(levelId, inRotation);
  }
}
