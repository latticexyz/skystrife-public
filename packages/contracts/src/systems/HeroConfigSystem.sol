// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import { System } from "@latticexyz/world/src/System.sol";
import { HeroInRotation, HeroInSeasonPassRotation } from "../codegen/index.sol";
import { addressToEntity, isAdmin } from "../libraries/LibUtils.sol";

contract HeroConfigSystem is System {
  function setHeroInRotation(bytes32 template, bool inRotation) public {
    require(isAdmin(addressToEntity(_msgSender())), "admin only system");

    HeroInRotation.set(template, inRotation);
  }

  function setHeroInSeasonPassRotation(bytes32 template, bool inRotation) public {
    require(isAdmin(addressToEntity(_msgSender())), "admin only system");

    HeroInSeasonPassRotation.set(template, inRotation);
  }
}
