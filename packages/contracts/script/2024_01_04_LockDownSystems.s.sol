// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Script.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Systems } from "@latticexyz/world/src/codegen/index.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

import { AttackSystem } from "../src/systems/AttackSystem.sol";
import { CombatResultSystem } from "../src/systems/CombatResultSystem.sol";
import { FinishSystem } from "../src/systems/FinishSystem.sol";
import { PlayerSetupSystem } from "../src/systems/PlayerSetupSystem.sol";

import "forge-std/console.sol";

contract LockDownSystems is Script {
  function run() external {
    IWorld world = IWorld(0x7203e7ADfDF38519e1ff4f8Da7DCdC969371f377);
    StoreSwitch.setStoreAddress(0x7203e7ADfDF38519e1ff4f8Da7DCdC969371f377);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    ResourceId attackSystemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "", "AttackSystem");
    (address addr, bool publicAccess) = Systems.get(attackSystemId);
    console.log("Found existing AttackSystem address: %s, public access: %s", addr, publicAccess);

    world.registerSystem(attackSystemId, new AttackSystem(), false);
    (addr, publicAccess) = Systems.get(attackSystemId);
    console.log("new AttackSystem address: %s, public access: %s", addr, publicAccess);

    ResourceId combatResultSystemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "", "CombatResultSyst");
    (addr, publicAccess) = Systems.get(combatResultSystemId);
    console.log("Found existing CombatResultSystem address: %s, public access: %s", addr, publicAccess);

    world.registerSystem(combatResultSystemId, new CombatResultSystem(), false);
    (addr, publicAccess) = Systems.get(combatResultSystemId);
    console.log("new CombatResultSystem address: %s, public access: %s", addr, publicAccess);

    ResourceId finishSystemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "", "FinishSystem");
    (addr, publicAccess) = Systems.get(finishSystemId);
    console.log("Found existing FinishSystem address: %s, public access: %s", addr, publicAccess);

    world.registerSystem(finishSystemId, new FinishSystem(), false);
    (addr, publicAccess) = Systems.get(finishSystemId);
    console.log("new FinishSystem address: %s, public access: %s", addr, publicAccess);

    ResourceId playerSetupSystemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "", "PlayerSetupSyste");
    (addr, publicAccess) = Systems.get(playerSetupSystemId);
    console.log("Found existing PlayerSetupSystem address: %s, public access: %s", addr, publicAccess);

    world.registerSystem(playerSetupSystemId, new PlayerSetupSystem(), false);
    (addr, publicAccess) = Systems.get(playerSetupSystemId);
    console.log("new PlayerSetupSystem address: %s, public access: %s", addr, publicAccess);

    vm.stopBroadcast();
  }
}
