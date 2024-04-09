// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Systems } from "@latticexyz/world/src/codegen/index.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

import { SeasonPassConfig } from "../src/codegen/index.sol";
import { SeasonPassSystem } from "../src/systems/SeasonPassSystem.sol";

import "forge-std/console.sol";

contract PatchSeasonPass is Script {
  function run() external {
    IWorld world = IWorld(0x7203e7ADfDF38519e1ff4f8Da7DCdC969371f377);
    StoreSwitch.setStoreAddress(0x7203e7ADfDF38519e1ff4f8Da7DCdC969371f377);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    ResourceId seasonPassSystemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "", "SeasonPassSystem");
    (address addr, bool publicAccess) = Systems.get(seasonPassSystemId);
    console.log("Found existing SeasonPassSystem address: %s, public access: %s", addr, publicAccess);

    world.registerSystem(seasonPassSystemId, new SeasonPassSystem(), true);
    (addr, publicAccess) = Systems.get(seasonPassSystemId);
    console.log("new SeasonPassSystem address: %s, public access: %s", addr, publicAccess);

    SeasonPassConfig.setRate(86806);

    vm.stopBroadcast();
  }
}
