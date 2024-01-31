// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import { System } from "@latticexyz/world/src/System.sol";
import { OfficialLevel } from "../codegen/index.sol";
import { skyKeyHolderOnly } from "../libraries/LibSkyPool.sol";

contract OfficialLevelSystem is System {
  function setOfficial(bytes32 levelId, bool official) public {
    skyKeyHolderOnly(_msgSender());

    OfficialLevel.set(levelId, official);
  }
}
