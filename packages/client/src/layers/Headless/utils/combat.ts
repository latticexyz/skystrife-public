import {
  Component,
  Entity,
  getComponentValue,
  getComponentValueStrict,
  Has,
  hasComponent,
  HasValue,
  runQuery,
  Type,
} from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { NetworkLayer } from "../../Network";
import { WorldCoord } from "../../../types";

// This file mirrors the functionality found in LibCombat.sol

function calculateDamageAttacker(layer: NetworkLayer, attacker: Entity, defender: Entity) {
  return Math.max(getStrength(layer, attacker, defender) - getArmor(layer, defender), 0);
}

function calculateDamageDefender(layer: NetworkLayer, attacker: Entity, defender: Entity) {
  const defenderCombat = getComponentValueStrict(layer.components.Combat, defender);

  return Math.max(
    (defenderCombat.counterStrength * (getStrength(layer, defender, attacker) - getArmor(layer, attacker))) / 100,
    0
  );
}

export function calculateCombatResult(layer: NetworkLayer, attacker: Entity, defender: Entity) {
  const {
    components: { Range },
  } = layer;

  const attackerRange = getComponentValueStrict(Range, attacker);

  const attackerDamage = calculateDamageAttacker(layer, attacker, defender);

  const defenderDamage =
    isPassive(layer, defender) || attackerRange.max > 1 ? 0 : calculateDamageDefender(layer, attacker, defender);

  return {
    attackerDamage: Math.min(Math.round(attackerDamage / 1000), 100),
    defenderDamage: Math.min(Math.round(defenderDamage / 1000), 100),
  };
}

export function getModiferAtPosition(
  layer: NetworkLayer,
  modifierComponent: Component<{ value: Type.Number }>,
  position: WorldCoord
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

  return getComponentValue(Combat, entity)?.counterStrength === 0 || isNeutralStructure(layer, entity);
}

export function canRetaliate(layer: NetworkLayer, entity: Entity) {
  return !isPassive(layer, entity) && !isNeutralStructure(layer, entity);
}

export function getStrength(layer: NetworkLayer, attacker: Entity, defender: Entity) {
  const {
    components: { Combat, StructureType },
  } = layer;

  const attackerCombat = getComponentValueStrict(Combat, attacker);

  return hasComponent(StructureType, defender) ? attackerCombat.structureStrength : attackerCombat.strength;
}

export function getArmor(layer: NetworkLayer, entity: Entity) {
  const {
    components: { Position, Combat, ArmorModifier },
  } = layer;

  return (
    getComponentValueStrict(Combat, entity).armor +
    getModiferAtPosition(layer, ArmorModifier, getComponentValueStrict(Position, entity))
  );
}
