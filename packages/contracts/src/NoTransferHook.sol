// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";

contract NoTransferHook is SystemHook {
  bytes4 constant transferFromSelector = bytes4(keccak256("transferFrom(address,address,uint256)"));

  function onBeforeCallSystem(address, ResourceId, bytes memory callData) public pure {
    bytes4 selector = bytes4(callData);
    require(selector != transferFromSelector, "this token is non-transferrable");
  }

  function onAfterCallSystem(address, ResourceId, bytes memory) public {}
}
