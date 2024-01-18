// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import { System } from "@latticexyz/world/src/System.sol";
import { HeroInRotation, HeroInSeasonPassRotation } from "../codegen/index.sol";
import { skyKeyHolderOnly } from "../libraries/LibSkyPool.sol";

contract HeroConfigSystem is System {
  function setHeroInRotation(bytes32 template, bool inRotation) public {
    skyKeyHolderOnly(_msgSender());

    HeroInRotation.set(template, inRotation);
  }

  function setHeroInSeasonPassRotation(bytes32 template, bool inRotation) public {
    skyKeyHolderOnly(_msgSender());

    HeroInSeasonPassRotation.set(template, inRotation);
  }
}
