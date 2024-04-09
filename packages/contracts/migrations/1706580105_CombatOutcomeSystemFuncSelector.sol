// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

// table imports
import { CombatOutcome } from "../src/codegen/index.sol";

// import { CombatOutcomeSystem } from "../src/systems/CombatOutcomeSystem.sol";

contract CombatOutcomeSystemFuncSelector is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    ResourceId systemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "", "CombatOutcomeSys");
    // world.registerRootFunctionSelector(
    //   systemId,
    //   "setCombatOutcome(bytes32,(bytes32,bytes32,int32,int32,int32,int32,bool,bool,bool,bool,uint256,uint256))",
    //   CombatOutcomeSystem.setCombatOutcome.selector
    // );

    vm.stopBroadcast();
  }
}
