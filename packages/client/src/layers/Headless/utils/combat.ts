import { Component, Entity, getComponentValue, Has, hasComponent, HasValue, runQuery, Type } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { NetworkLayer } from "../../Network";
import { WorldCoord } from "../../../types";
import { encodeEntity } from "@latticexyz/store-sync/recs";

// This file mirrors the functionality found in LibCombat.sol

function calculateDamageAttacker(layer: NetworkLayer, attacker: Entity, defender: Entity) {
  const {
    components: { Combat, ArmorModifier, Position },
  } = layer;

  const attackerCombat = getComponentValue(Combat, attacker);
  if (!attackerCombat) return 0;

  const archetypeModifier = getArchetypeMatchupModifier(layer, attacker, defender);
  const terrainModifier = getModiferAtPosition(
    layer,
    ArmorModifier,
    getComponentValue(Position, defender) || { x: 0, y: 0 },
  );

  return attackerCombat.strength * ((100 + archetypeModifier + terrainModifier) / 100);
}

function calculateDamageDefender(layer: NetworkLayer, attacker: Entity, defender: Entity, atPosition?: WorldCoord) {
  const {
    components: { Combat, ArmorModifier, Position },
  } = layer;

  const defenderCombat = getComponentValue(Combat, defender);
  if (!defenderCombat) return 0;

  const archetypeModifier = getArchetypeMatchupModifier(layer, defender, attacker);
  const terrainModifier = getModiferAtPosition(
    layer,
    ArmorModifier,
    atPosition || getComponentValue(Position, attacker) || { x: 0, y: 0 },
  );

  const damage = defenderCombat.strength * ((100 + archetypeModifier + terrainModifier) / 100);
  const counterStrengthMod = (100 + defenderCombat.counterStrength) / 100;
  return damage * counterStrengthMod;
}

export function getArchetypeMatchupModifier(layer: NetworkLayer, attacker: Entity, defender: Entity) {
  const {
    components: { Combat, ArchetypeModifier },
  } = layer;

  const attackerArchetype = getComponentValue(Combat, attacker)?.archetype;
  const defenderArchetype = getComponentValue(Combat, defender)?.archetype;
  if (!attackerArchetype || !defenderArchetype) return 0;

  const archetypeModifierEntity = encodeEntity(
    {
      attacker: "uint8",
      defender: "uint8",
    },
    {
      attacker: attackerArchetype,
      defender: defenderArchetype,
    },
  );

  return getComponentValue(ArchetypeModifier, archetypeModifierEntity)?.mod ?? 0;
}

export function calculateCombatResult(
  layer: NetworkLayer,
  attacker: Entity,
  defender: Entity,
  atPosition?: WorldCoord,
) {
  const attackerDamage = calculateDamageAttacker(layer, attacker, defender);
  const attackerRange = getComponentValue(layer.components.Combat, attacker)?.maxRange ?? 0;

  const defenderDamage =
    attackerRange > 1 || isPassive(layer, defender)
      ? 0
      : calculateDamageDefender(layer, attacker, defender, atPosition);

  return {
    attackerDamage: Math.max(attackerDamage, 1_000) / 1000,
    defenderDamage: Math.max(defenderDamage, 1_000) / 1000,
  };
}

export function getModiferAtPosition(
  layer: NetworkLayer,
  modifierComponent: Component<{ value: Type.Number }>,
  position: WorldCoord,
) {
  const {
    components: { Position, TerrainType },
  } = layer;

  const entityWithModifier = [...runQuery([HasValue(Position, position), Has(TerrainType), Has(modifierComponent)])][0];
  const modifier = getComponentValue(modifierComponent, entityWithModifier);
  if (!modifier) return 0;

  return modifier.value;
}

export function isNeutralStructure(layer: NetworkLayer, entity: Entity) {
  const {
    components: { StructureType, OwnedBy },
  } = layer;

  return (
    hasComponent(StructureType, entity) &&
    (!hasComponent(OwnedBy, entity) || BigNumber.from(getComponentValue(OwnedBy, entity)?.value) === BigNumber.from(0))
  );
}

export function isPassive(layer: NetworkLayer, entity: Entity) {
  const {
    components: { Combat },
  } = layer;

  return getComponentValue(Combat, entity)?.counterStrength === -100 || isNeutralStructure(layer, entity);
}

export function canRetaliate(layer: NetworkLayer, entity: Entity) {
  return !isPassive(layer, entity) && !isNeutralStructure(layer, entity);
}
