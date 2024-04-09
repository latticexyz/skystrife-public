// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

// table imports
import { RequiresSetup } from "../src/codegen/index.sol";

import { MoveSystem } from "./../src/systems/MoveSystem.sol";
import { redeploySystem } from "./migrationUtils.sol";

contract DeployRequiresSetup is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    RequiresSetup.register();
    redeploySystem(world, new MoveSystem(), "MoveSystem");

    vm.stopBroadcast();
  }
}
