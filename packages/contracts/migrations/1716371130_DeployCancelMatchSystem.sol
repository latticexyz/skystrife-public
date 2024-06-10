// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

import { CancelMatchSystem } from "../src/systems/CancelMatchSystem.sol";
import { PlayerDeregisterSystem } from "../src/systems/PlayerDeregisterSystem.sol";
import { deploySystem } from "./migrationUtils.sol";

import { MatchStaleTime } from "../src/codegen/index.sol";

contract DeployCancelMatchSystem is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    MatchStaleTime.register();
    MatchStaleTime.set(1 hours);

    deploySystem(world, new CancelMatchSystem(), "CancelMatchSyste", true);
    // TODO register function selector for this as well... does deploy not do it?
    deploySystem(world, new PlayerDeregisterSystem(), "PlayerDeregister", true);

    vm.stopBroadcast();
  }
}
