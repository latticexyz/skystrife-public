// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

// table imports
import { MatchIndexToEntity, MatchSky } from "../src/codegen/index.sol";

import "forge-std/console.sol";

contract ManuallyEditMatchCreationTime is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    bytes32 matchEntity = MatchIndexToEntity.get(2672);
    console.logBytes32(matchEntity);

    uint256 createdAt = MatchSky.getCreatedAt(matchEntity);
    console.logUint(createdAt);

    MatchSky.setCreatedAt(matchEntity, 0);

    vm.stopBroadcast();
  }
}
