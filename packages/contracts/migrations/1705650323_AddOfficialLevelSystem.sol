// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

import { OfficialLevel } from "../src/codegen/index.sol";

import { OfficialLevelSystem } from "../src/systems/OfficialLevelSystem.sol";

contract AddOfficialLevelSystem is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    OfficialLevel.register();

    ResourceId systemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "", "OfficialLevelSys");
    world.registerSystem(systemId, new OfficialLevelSystem(), true);

    world.registerRootFunctionSelector(systemId, "setOfficial(bytes32,bool)", OfficialLevelSystem.setOfficial.selector);

    vm.stopBroadcast();
  }
}
