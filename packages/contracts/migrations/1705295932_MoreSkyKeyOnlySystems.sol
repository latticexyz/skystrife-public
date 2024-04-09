// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

import { redeploySystem } from "./migrationUtils.sol";

import { HeroConfigSystem } from "../src/systems/HeroConfigSystem.sol";
import { LevelRotationSystem } from "../src/systems/LevelRotationSystem.sol";
import { LevelUploadSystem } from "../src/systems/LevelUploadSystem.sol";

contract MoreSkyKeyOnlySystems is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    redeploySystem(world, new HeroConfigSystem(), "HeroConfigSystem");
    redeploySystem(world, new LevelRotationSystem(), "LevelRotationSys");
    redeploySystem(world, new LevelUploadSystem(), "LevelUploadSyste");

    vm.stopBroadcast();
  }
}
