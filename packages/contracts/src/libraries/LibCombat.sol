// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { Bytes } from "@latticexyz/store/src/Bytes.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { SystemSwitch } from "@latticexyz/world-modules/src/utils/SystemSwitch.sol";

import { MatchConfig, LevelTemplatesIndex, Capturable, Combat, Charger, CombatData, Range, OwnedBy, RangeData, Position, PositionData, ArmorModifierTableId, StructureType, SpawnPointTableId, OwnedBy, Stamina, LastAction, MatchRanking, SpawnPoint, StaminaOnKill, StructureType } from "../codegen/index.sol";
import { SpawnSettlementTemplateId } from "../codegen/Templates.sol";
import { StructureTypes } from "../codegen/common.sol";

import { max, getOwningPlayer, getIndicesAtPosition } from "./LibUtils.sol";
import { LibStamina } from "./LibStamina.sol";
import { LibMove } from "./LibMove.sol";
import { charge } from "./LibCharge.sol";
import { removePosition } from "./LibPosition.sol";

import { FinishSystem } from "../systems/FinishSystem.sol";

library LibCombat {
  function onKill(bytes32 matchEntity, bytes32 attackerOwningPlayer, bytes32 defender) internal {
    if (attackerOwningPlayer != 0)
      LibStamina.addStamina(matchEntity, attackerOwningPlayer, StaminaOnKill.get(matchEntity, defender));

    // If a spawn has been destroyed, a player is out of the game
    if (SpawnPoint.get(matchEntity, defender)) {
      bytes32 levelId = MatchConfig.getLevelId(matchEntity);

      // Prepend the defender owner to the start of the ranking array
      SystemSwitch.call(
        abi.encodeCall(FinishSystem.prependRanking, (matchEntity, getOwningPlayer(matchEntity, defender)))
      );

      // If all but one player has been killed, end the game
      if (MatchRanking.length(matchEntity) == LevelTemplatesIndex.length(levelId, SpawnSettlementTemplateId) - 1) {
        SystemSwitch.call(abi.encodeCall(FinishSystem.finish, (matchEntity, getOwningPlayer(matchEntity, defender))));
      }
    }
  }

  function dealDamage(
    bytes32 matchEntity,
    bytes32 attacker,
    bytes32 defender,
    int32 damage
  ) internal returns (bool defenderDied, bool defenderCaptured) {
    bytes32 attackerOwningPlayer = getOwningPlayer(matchEntity, attacker);

    int32 newHealth = Combat.getHealth(matchEntity, defender) - damage;
    Combat.setHealth(matchEntity, defender, newHealth);

    if (newHealth <= 0) {
      if (Capturable.get(matchEntity, defender)) {
        capture(matchEntity, attackerOwningPlayer, defender);
        defenderCaptured = true;
      } else {
        defenderDied = true;

        onKill(matchEntity, attackerOwningPlayer, defender);
      }
    }
  }

  function calculateDamageAttacker(
    bytes32 matchEntity,
    bytes32 attacker,
    bytes32 defender
  ) internal view returns (int32) {
    return max(getStrength(matchEntity, attacker, defender) - getArmor(matchEntity, defender), 0);
  }

  function calculateDamageDefender(
    bytes32 matchEntity,
    bytes32 attacker,
    bytes32 defender
  ) internal view returns (int32) {
    return
      max(
        (Combat.getCounterStrength(matchEntity, defender) *
          (getStrength(matchEntity, defender, attacker) - getArmor(matchEntity, attacker))) / 100,
        0
      );
  }

  function getStrength(
    bytes32 matchEntity,
    bytes32 attacker,
    bytes32 defender
  ) internal view returns (int32 baseStrength) {
    baseStrength = Combat.getStrength(matchEntity, attacker);
    if (StructureType.get(matchEntity, defender) != StructureTypes.Unknown) {
      baseStrength = Combat.getStructureStrength(matchEntity, attacker);
    }
  }

  /**
   * @notice Sum the armor modifier of all the indices in `levelId` with the given `position`.
   */
  function getArmor(bytes32 matchEntity, bytes32 entity) internal view returns (int32) {
    bytes32 levelId = MatchConfig.getLevelId(matchEntity);

    PositionData memory position = Position.get(matchEntity, entity);

    int32 armorAtPosition = LibMove.getArmorModifierAtPosition(levelId, position);

    return Combat.getArmor(matchEntity, entity) + armorAtPosition;
  }

  function isNeutralStructure(bytes32 matchEntity, bytes32 entity) internal view returns (bool) {
    return StructureType.get(matchEntity, entity) != StructureTypes.Unknown && OwnedBy.get(matchEntity, entity) == 0;
  }

  function isPassive(bytes32 matchEntity, bytes32 entity) internal view returns (bool) {
    return Combat.getCounterStrength(matchEntity, entity) == 0 || isNeutralStructure(matchEntity, entity);
  }

  function kill(bytes32 matchEntity, bytes32 entity) internal {
    removePosition(matchEntity, entity);
    Combat.deleteRecord(matchEntity, entity);
    Stamina.deleteRecord(matchEntity, entity);
    OwnedBy.deleteRecord(matchEntity, entity);
  }

  function capture(bytes32 matchEntity, bytes32 attackerOwningPlayer, bytes32 defender) internal {
    bytes32 previousOwner = getOwningPlayer(matchEntity, defender);
    if (previousOwner != 0) {
      // update the previous owner's gold total before capturing
      LibStamina.persistStamina(matchEntity, previousOwner);
    }

    OwnedBy.set(matchEntity, defender, attackerOwningPlayer);
    Combat.setHealth(matchEntity, defender, Combat.getMaxHealth(matchEntity, defender));

    if (Charger.get(matchEntity, defender) > 0) {
      charge(matchEntity, defender, attackerOwningPlayer);
    }
  }
}
