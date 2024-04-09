// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

import { CopyMapSystem } from "../src/systems/CopyMapSystem.sol";

import { redeploySystem } from "./migrationUtils.sol";

contract PatchCopyMapSystem is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    redeploySystem(world, new CopyMapSystem(), "CopyMapSystem");

    vm.stopBroadcast();
  }
}
