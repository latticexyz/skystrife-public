// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

// table imports
import { MatchConfig, MatchReady } from "../src/codegen/index.sol";

contract DeleteBustedMatches is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    bytes32 entity = bytes32(0x5940492200000000000000000000000000000000000000000000000000000000);
    MatchConfig.deleteRecord(entity);
    MatchReady.deleteRecord(entity);

    entity = bytes32(0x189cfe5200000000000000000000000000000000000000000000000000000000);
    MatchConfig.deleteRecord(entity);
    MatchReady.deleteRecord(entity);

    entity = bytes32(0x373d3df200000000000000000000000000000000000000000000000000000000);
    MatchConfig.deleteRecord(entity);
    MatchReady.deleteRecord(entity);

    entity = bytes32(0x7058cb1a00000000000000000000000000000000000000000000000000000000);
    MatchConfig.deleteRecord(entity);
    MatchReady.deleteRecord(entity);

    entity = bytes32(0x01ab048d00000000000000000000000000000000000000000000000000000000);
    MatchConfig.deleteRecord(entity);
    MatchReady.deleteRecord(entity);

    entity = bytes32(0x55e3ab4700000000000000000000000000000000000000000000000000000000);
    MatchConfig.deleteRecord(entity);
    MatchReady.deleteRecord(entity);

    entity = bytes32(0x7c55a04f00000000000000000000000000000000000000000000000000000000);
    MatchConfig.deleteRecord(entity);
    MatchReady.deleteRecord(entity);

    entity = bytes32(0x0312855500000000000000000000000000000000000000000000000000000000);
    MatchConfig.deleteRecord(entity);
    MatchReady.deleteRecord(entity);

    vm.stopBroadcast();
  }
}
