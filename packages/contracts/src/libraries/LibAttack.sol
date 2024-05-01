// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { CombatOutcomeData, Combat } from "../codegen/index.sol";
import { LibCombat } from "../libraries/LibCombat.sol";

import { LibCombatOutcome } from "base/libraries/LibCombatOutcome.sol";

library LibAttack {
  function attack(bytes32 matchEntity, bytes32 attacker, bytes32 defender) public {
    int32 attackerDamage = LibCombat.calculateDamageAttacker(matchEntity, attacker, defender);
    int32 defenderDamage = LibCombat.calculateDamageDefender(matchEntity, attacker, defender);

    (bool defenderDied, bool defenderCaptured) = LibCombat.dealDamage(matchEntity, attacker, defender, attackerDamage);

    bool attackerDied;
    bool ranged = Combat.getMaxRange(matchEntity, attacker) != 1;
    // If the attacker is in melee range and the defender is not passive,
    // the defender counterattacks
    if (!ranged) {
      (attackerDied, ) = LibCombat.dealDamage(matchEntity, defender, attacker, defenderDamage);
    } else {
      defenderDamage = 0;
    }

    // trigger kills after combat is evaluated
    // if we trigger them before, units may be dead and we can't access their data
    if (defenderDied) LibCombat.kill(matchEntity, defender);
    if (attackerDied) LibCombat.kill(matchEntity, attacker);

    LibCombatOutcome.setCombatOutcome(
      matchEntity,
      CombatOutcomeData({
        attacker: attacker,
        defender: defender,
        attackerDamageReceived: defenderDamage,
        defenderDamageReceived: attackerDamage,
        attackerDamage: attackerDamage,
        defenderDamage: defenderDamage,
        ranged: ranged,
        attackerDied: attackerDied,
        defenderDied: defenderDied,
        defenderCaptured: defenderCaptured,
        blockNumber: block.number,
        timestamp: block.timestamp
      })
    );
  }
}
