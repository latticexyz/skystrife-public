// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System } from "@latticexyz/world/src/System.sol";
import { Systems } from "@latticexyz/world/src/codegen/index.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

import "forge-std/console.sol";

function redeploySystem(IWorld world, System systemContract, bytes16 systemName) {
  ResourceId systemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "", systemName);
  (address addr, bool publicAccess) = Systems.get(systemId);

  world.registerSystem(systemId, systemContract, publicAccess);
  (addr, publicAccess) = Systems.get(systemId);
}
