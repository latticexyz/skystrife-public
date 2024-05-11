// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

import { SkyPoolConfig } from "../src/codegen/index.sol";
import { MatchSystem } from "./../src/systems/MatchSystem.sol";
import { redeploySystem } from "./migrationUtils.sol";

contract RewardsCurve is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    redeploySystem(world, new MatchSystem(), "MatchSystem");

    // two days
    SkyPoolConfig.setWindow(60 * 60 * 24 * 2);

    vm.stopBroadcast();
  }
}
