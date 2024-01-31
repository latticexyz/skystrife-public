// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import { System } from "@latticexyz/world/src/System.sol";
import { LevelInStandardRotation, LevelInSeasonPassRotation } from "../codegen/index.sol";
import { skyKeyHolderOnly } from "../libraries/LibSkyPool.sol";

contract LevelRotationSystem is System {
  function setRotationStandard(bytes32 levelId, bool inRotation) public {
    skyKeyHolderOnly(_msgSender());

    LevelInStandardRotation.set(levelId, inRotation);
  }

  function setRotationSeasonPass(bytes32 levelId, bool inRotation) public {
    skyKeyHolderOnly(_msgSender());

    LevelInSeasonPassRotation.set(levelId, inRotation);
  }
}
