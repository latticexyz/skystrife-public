// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

/* Autogenerated file. Do not edit manually. */

import { CombatOutcomeData } from "./../index.sol";

/**
 * @title ICombatOutcomeSystem
 * @dev This interface is automatically generated from the corresponding system contract. Do not edit manually.
 */
interface ICombatOutcomeSystem {
  function setCombatOutcome(bytes32 matchEntity, CombatOutcomeData memory combatOutcomeData) external;
}
