// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { CombatOutcome, CombatOutcomeData } from "../codegen/index.sol";
import { createMatchEntity } from "../createMatchEntity.sol";

library LibCombatOutcome {
  function setCombatOutcome(bytes32 matchEntity, CombatOutcomeData memory combatOutcomeData) public {
    CombatOutcome.set(matchEntity, createMatchEntity(matchEntity), combatOutcomeData);
  }
}
