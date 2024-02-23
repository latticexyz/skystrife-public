// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

// table imports
import { CombatArchetype, ArchetypeModifier } from "../src/codegen/index.sol";

import { AttackSystem } from "./../src/systems/AttackSystem.sol";

import { redeploySystem } from "./migrationUtils.sol";

import { createTemplates } from "../src/codegen/scripts/CreateTemplates.sol";
import { createArchetypeModifiers } from "../src/libraries/LibArchetypes.sol";

contract CombatRevamp is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    CombatArchetype.register();
    ArchetypeModifier.register();

    redeploySystem(world, new AttackSystem(), "AttackSystem");

    createTemplates();
    createArchetypeModifiers();

    vm.stopBroadcast();
  }
}
