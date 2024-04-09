// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { SpawnSettlementTemplate } from "../src/codegen/Templates.sol";

contract ChangeSpawnSettlementTemplateStaminaOnKill is Script {
  function run() external {
    StoreSwitch.setStoreAddress(0x7203e7ADfDF38519e1ff4f8Da7DCdC969371f377);

    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    vm.startBroadcast(deployerPrivateKey);

    SpawnSettlementTemplate();

    vm.stopBroadcast();
  }
}
