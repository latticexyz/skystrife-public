// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { createTemplates } from "../src/codegen/scripts/CreateTemplates.sol";

import { SeasonPassConfig } from "../src/codegen/index.sol";

contract ChangeSeasonPassDecreaseRate is Script {
  function run() external {
    IWorld world = IWorld(0x7203e7ADfDF38519e1ff4f8Da7DCdC969371f377);
    StoreSwitch.setStoreAddress(0x7203e7ADfDF38519e1ff4f8Da7DCdC969371f377);

    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    vm.startBroadcast(deployerPrivateKey);
    SeasonPassConfig.setRate(0.0075 ether);
    vm.stopBroadcast();
  }
}