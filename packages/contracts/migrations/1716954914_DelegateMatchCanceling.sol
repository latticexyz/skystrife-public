// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { CALLBOUND_DELEGATION, SYSTEMBOUND_DELEGATION, TIMEBOUND_DELEGATION } from "@latticexyz/world-modules/src/modules/std-delegations/StandardDelegationsModule.sol";
import { SystemboundDelegationControl } from "@latticexyz/world-modules/src/modules/std-delegations/SystemboundDelegationControl.sol";

// table imports
import { MatchConfig } from "../src/codegen/index.sol";

uint256 constant MAX_UINT256 = type(uint256).max;

contract DelegateMatchCanceling is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    address delegatee = address(0xcC97222Ea7d3c014f5C8e7406D21b8a5Cb3aDC87);
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    ResourceId systemId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "",
      name: "CancelMatchSyste"
    });
    world.registerDelegation(
      delegatee,
      SYSTEMBOUND_DELEGATION,
      abi.encodeCall(SystemboundDelegationControl.initDelegation, (delegatee, systemId, MAX_UINT256))
    );

    vm.stopBroadcast();
  }
}
