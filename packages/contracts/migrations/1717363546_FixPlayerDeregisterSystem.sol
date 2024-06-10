// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

// table imports
import { MatchConfig } from "../src/codegen/index.sol";

contract FixPlayerDeregisterSystem is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    ResourceId systemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "", "PlayerDeregister");
    world.registerRootFunctionSelector(
      systemId,
      "deregister(bytes32,uint256,bytes32)",
      "deregister(bytes32,uint256,bytes32)"
    );

    vm.stopBroadcast();
  }
}
