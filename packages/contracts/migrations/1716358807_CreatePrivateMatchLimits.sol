// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

import { MatchSystem } from "../src/systems/MatchSystem.sol";

// table imports
import { SeasonPassPrivateMatchLimit, PrivateMatchesCreated } from "../src/codegen/index.sol";

import { SEASON_PASS_PRIVATE_MATCH_LIMIT } from "../constants.sol";
import { redeploySystem } from "./migrationUtils.sol";

contract CreatePrivateMatchLimits is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    SeasonPassPrivateMatchLimit.register();
    PrivateMatchesCreated.register();
    SeasonPassPrivateMatchLimit.set(SEASON_PASS_PRIVATE_MATCH_LIMIT);

    redeploySystem(world, new MatchSystem(), "MatchSystem");

    vm.stopBroadcast();
  }
}
