// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { System } from "@latticexyz/world/src/System.sol";

import { IAllowSystem } from "../IAllowSystem.sol";
import { hasSeasonPass } from "../hasToken.sol";

contract SeasonPassOnlySystem is System, IAllowSystem {
  function isAllowed(bytes32, address account) public view returns (bool) {
    return hasSeasonPass(account);
  }
}
