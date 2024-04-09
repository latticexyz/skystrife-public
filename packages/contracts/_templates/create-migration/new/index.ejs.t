---
timestamp: <%= timestamp %>
to: migrations/<%= timestamp %>_<%= name %>.sol
name: <%= name %>
---

// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

// table imports
import {
  MatchConfig
} from "../src/codegen/index.sol";

contract <%= name %> is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    // your code here

    vm.stopBroadcast();
  }
}
