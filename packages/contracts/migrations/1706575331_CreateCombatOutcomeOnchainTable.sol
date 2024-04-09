// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

// table imports
import { CombatOutcome } from "../src/codegen/index.sol";

import { redeploySystem, deploySystem } from "./migrationUtils.sol";

// import { CombatOutcomeSystem } from "../src/systems/CombatOutcomeSystem.sol";
// import { AttackSystem } from "../src/systems/AttackSystem.sol";

contract CreateCombatOutcomeOnchainTable is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    CombatOutcome.register();
    // deploySystem(world, new CombatOutcomeSystem(), "CombatOutcomeSys", false);
    // redeploySystem(world, new AttackSystem(), "AttackSystem");

    vm.stopBroadcast();
  }
}
