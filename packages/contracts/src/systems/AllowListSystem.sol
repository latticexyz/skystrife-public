// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { System } from "@latticexyz/world/src/System.sol";

import { addressToEntity } from "../libraries/LibUtils.sol";
import { IAllowSystem } from "../IAllowSystem.sol";

import { MatchAllowed, MatchConfig } from "../codegen/index.sol";

contract AllowListSystem is System, IAllowSystem {
  function isAllowed(bytes32 matchEntity, address account) public view returns (bool) {
    return MatchAllowed.get(matchEntity, account);
  }

  function setMembers(bytes32 matchEntity, address[] memory accounts) public {
    bytes32 entity = addressToEntity(_msgSender());
    bytes32 createdBy = MatchConfig.getCreatedBy(matchEntity);
    require(entity == createdBy, "Caller is not match creator");

    for (uint256 i; i < accounts.length; i++) {
      MatchAllowed.set(matchEntity, accounts[i], true);
    }
  }
}
