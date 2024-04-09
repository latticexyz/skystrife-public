// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IWorld } from "../codegen/world/IWorld.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { SystemSwitch } from "@latticexyz/world-modules/src/utils/SystemSwitch.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";
import { skyKeyHolderOnly } from "../libraries/LibSkyPool.sol";

contract WithdrawSystem is System {
  function withdrawEth(address to, uint256 amount) public {
    skyKeyHolderOnly(_msgSender());

    IWorld world = IWorld(_world());
    ResourceId rootNamespace = WorldResourceIdLib.encodeNamespace("");

    bytes memory data = SystemSwitch.call(abi.encodeCall(world.transferBalanceToAddress, (rootNamespace, to, amount)));
  }
}
