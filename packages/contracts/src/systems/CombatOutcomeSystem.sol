// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "@latticexyz/world/src/System.sol";

import { CombatOutcome, CombatOutcomeData } from "../codegen/index.sol";
import { createMatchEntity } from "../createMatchEntity.sol";

// internal system
// MUD table libraries use a considerable amount of bytecode so this system splits overall contract size
contract CombatOutcomeSystem is System {
  function setCombatOutcome(bytes32 matchEntity, CombatOutcomeData memory combatOutcomeData) public {
    CombatOutcome.set(matchEntity, createMatchEntity(matchEntity), combatOutcomeData);
  }
}
