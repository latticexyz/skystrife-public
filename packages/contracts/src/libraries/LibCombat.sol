// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { MatchConfig, LevelTemplatesIndex, Capturable, Combat, Charger, OwnedBy, Position, PositionData, StructureType, OwnedBy, Gold, MatchRanking, SpawnPoint, GoldOnKill, StructureType, ArchetypeModifier, Match } from "../codegen/index.sol";
import { SpawnSettlementTemplateId } from "../codegen/Templates.sol";
import { StructureTypes, CombatArchetypes } from "../codegen/common.sol";

import { getOwningPlayer } from "./LibUtils.sol";
import { LibGold } from "./LibGold.sol";
import { LibMove } from "./LibMove.sol";
import { LibMatchFinish } from "./LibMatchFinish.sol";
import { charge } from "./LibCharge.sol";
import { removePosition } from "./LibPosition.sol";

library LibCombat {
  function onKill(bytes32 matchEntity, bytes32 attackerOwningPlayer, bytes32 defender) internal {
    if (attackerOwningPlayer != 0)
      LibGold.addGold(matchEntity, attackerOwningPlayer, GoldOnKill.get(matchEntity, defender));

    // If a spawn has been destroyed, a player is out of the game
    if (SpawnPoint.get(matchEntity, defender)) {
      bytes32 levelId = MatchConfig.getLevelId(matchEntity);

      // Prepend the defender owner to the start of the ranking array
      LibMatchFinish.prependRanking(matchEntity, getOwningPlayer(matchEntity, defender));

      // If all but one player has been killed, end the game
      if (MatchRanking.length(matchEntity) == LevelTemplatesIndex.length(levelId, SpawnSettlementTemplateId) - 1) {
        LibMatchFinish.finish(matchEntity, getOwningPlayer(matchEntity, defender));
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
    int32 baseStrength = Combat.getStrength(matchEntity, attacker);

    CombatArchetypes attackerArchetype = Combat.getArchetype(matchEntity, attacker);
    CombatArchetypes defenderArchetype = Combat.getArchetype(matchEntity, defender);
    int32 archetypeMatchupModifier = ArchetypeModifier.getMod(attackerArchetype, defenderArchetype);

    int32 terrainModifier = getCombatModifierAtPosition(matchEntity, defender);

    int32 mod = archetypeMatchupModifier + terrainModifier;
    return (baseStrength * (100 + mod)) / 100;
  }

  function calculateDamageDefender(
    bytes32 matchEntity,
    bytes32 attacker,
    bytes32 defender
  ) internal view returns (int32) {
    int32 baseStrength = Combat.getStrength(matchEntity, defender);

    CombatArchetypes attackerArchetype = Combat.getArchetype(matchEntity, attacker);
    CombatArchetypes defenderArchetype = Combat.getArchetype(matchEntity, defender);

    int32 archetypeMatchupModifier = ArchetypeModifier.getMod(defenderArchetype, attackerArchetype);
    int32 terrainModifier = getCombatModifierAtPosition(matchEntity, attacker);

    int32 mod = archetypeMatchupModifier + terrainModifier;
    int32 damage = (baseStrength * (100 + mod)) / 100;

    int32 counterStrengthModifier = Combat.getCounterStrength(matchEntity, defender);
    return (damage * (100 + counterStrengthModifier)) / 100;
  }

  /**
   * @notice Sum the armor modifier of all the indices in `levelId` with the given `position`.
   */
  function getCombatModifierAtPosition(bytes32 matchEntity, bytes32 entity) internal view returns (int32) {
    bytes32 levelId = MatchConfig.getLevelId(matchEntity);

    PositionData memory position = Position.get(matchEntity, entity);

    int32 armorAtPosition = LibMove.getArmorModifierAtPosition(levelId, position);

    return armorAtPosition;
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
    OwnedBy.deleteRecord(matchEntity, entity);
  }

  function capture(bytes32 matchEntity, bytes32 attackerOwningPlayer, bytes32 defender) internal {
    bytes32 previousOwner = getOwningPlayer(matchEntity, defender);
    if (previousOwner != 0) {
      // update the previous owner's gold total before capturing
      LibGold.persistGold(matchEntity, previousOwner);
    }

    OwnedBy.set(matchEntity, defender, attackerOwningPlayer);
    Combat.setHealth(matchEntity, defender, Combat.getMaxHealth(matchEntity, defender));

    if (Charger.get(matchEntity, defender) > 0) {
      charge(matchEntity, defender, attackerOwningPlayer);
    }
  }
}
