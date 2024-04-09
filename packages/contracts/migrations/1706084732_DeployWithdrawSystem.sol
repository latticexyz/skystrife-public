// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

import { deploySystem } from "./migrationUtils.sol";

import { WithdrawSystem } from "../src/systems/WithdrawSystem.sol";

contract DeployWithdrawSystem is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    deploySystem(world, new WithdrawSystem(), "WithdrawSystem", true);

    vm.stopBroadcast();
  }
}
