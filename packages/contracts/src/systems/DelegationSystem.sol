// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "@latticexyz/world/src/System.sol";
import { UserDelegationControl } from "@latticexyz/world/src/codegen/tables/UserDelegationControl.sol";

contract DelegationSystem is System {
  function unregisterDelegation(address delegatee) public {
    UserDelegationControl.deleteRecord(_msgSender(), delegatee);
  }
}
