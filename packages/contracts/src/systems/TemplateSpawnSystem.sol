// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import { System } from "@latticexyz/world/src/System.sol";
import { PositionData } from "../codegen/tables/Position.sol";
import { addressToEntity, isAdmin } from "../libraries/LibUtils.sol";
import { spawnTemplateAt } from "../libraries/LibTemplate.sol";

contract TemplateSpawnSystem is System {
  function spawnTemplate(
    bytes32 matchEntity,
    bytes32 prototypeId,
    bytes32 ownerId,
    PositionData memory position
  ) public {
    require(isAdmin(addressToEntity(_msgSender())), "admin only system");

    spawnTemplateAt(matchEntity, prototypeId, ownerId, position);
  }
}
