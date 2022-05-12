// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "@latticexyz/world/src/System.sol";

import { CombatResult, CombatResultData } from "../codegen/index.sol";

// internal system
// MUD table libraries use a considerable amount of bytecode so this system splits overall contract size
contract CombatResultSystem is System {
  function setCombatResult(bytes32 matchEntity, bytes32 attacker, CombatResultData memory combatResultData) public {
    CombatResult.set(matchEntity, attacker, combatResultData);
  }
}
