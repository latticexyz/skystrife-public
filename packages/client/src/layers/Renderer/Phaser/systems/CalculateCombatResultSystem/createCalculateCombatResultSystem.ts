import {
  defineSyncSystem,
  defineSystem,
  getComponentValue,
  getComponentValueStrict,
  Has,
  removeComponent,
  runQuery,
  setComponent,
  UpdateType,
} from "@latticexyz/recs";
import { calculateCombatResult, getModiferAtPosition } from "../../../../Headless/utils";
import { PhaserLayer } from "../../types";

export function createCalculateCombatResultSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      network: networkLayer,
      network: {
        components: { Combat, ArmorModifier, Position },
      },
      headless: {
        components: { NextPosition },
      },
    },
    components: { IncomingDamage, WillBeDestroyed, TerrainArmorBonus },
  } = layer;

  defineSyncSystem(
    world,
    [Has(Combat)],
    () => IncomingDamage,
    () => ({
      sources: [],
      values: [],
      commitments: [],
    }),
    { runOnInit: true },
  );

  defineSystem(world, [Has(NextPosition)], ({ entity, type }) => {
    const entitiesWithIncomingDamage = [...runQuery([Has(IncomingDamage)])];

    for (const entity of entitiesWithIncomingDamage) {
      const incomingDamage = getComponentValue(IncomingDamage, entity);
      if (!incomingDamage) continue;

      const sources = incomingDamage.sources;
      const values = incomingDamage.values;
      const commitments = incomingDamage.commitments;

      for (let i = 0; i < incomingDamage.sources.length; i++) {
        const commitment = incomingDamage.commitments[i];

        if (commitment === 0) {
          sources.splice(i, 1);
          values.splice(i, 1);
          commitments.splice(i, 1);
          continue;
        }
      }

      setComponent(IncomingDamage, entity, {
        sources,
        values,
        commitments,
      });
      setComponent(WillBeDestroyed, entity, { value: false });
      removeComponent(TerrainArmorBonus, entity);
    }

    if (type === UpdateType.Exit) {
      return;
    }

    const nextPosition = getComponentValueStrict(NextPosition, entity);
    if (nextPosition.intendedTarget) {
      const defender = nextPosition.intendedTarget;
      const attacker = entity;

      const combatResult = calculateCombatResult(layer.parentLayers.network, attacker, defender, {
        x: nextPosition.x,
        y: nextPosition.y,
      });

      const attackerIncomingDamage = getComponentValueStrict(IncomingDamage, attacker);
      attackerIncomingDamage.sources.push(defender);
      attackerIncomingDamage.values.push(combatResult.defenderDamage * 1000);
      attackerIncomingDamage.commitments.push(0);
      setComponent(IncomingDamage, attacker, attackerIncomingDamage);

      const defenderIncomingDamage = getComponentValueStrict(IncomingDamage, defender);
      defenderIncomingDamage.sources.push(attacker);
      defenderIncomingDamage.values.push(combatResult.attackerDamage * 1000);
      defenderIncomingDamage.commitments.push(0);
      setComponent(IncomingDamage, defender, defenderIncomingDamage);

      const attackerHealth = (getComponentValue(Combat, attacker)?.health ?? 0) / 1000;
      const defenderHealth = (getComponentValue(Combat, defender)?.health ?? 0) / 1000;

      const attackerTotalIncomingDamage = attackerIncomingDamage.values.reduce((acc, val) => acc + val / 1000, 0);
      if (attackerHealth - attackerTotalIncomingDamage <= 0) {
        setComponent(WillBeDestroyed, attacker, { value: true });
      }

      const defenderTotalIncomingDamage = defenderIncomingDamage.values.reduce((acc, val) => acc + val / 1000, 0);
      if (defenderHealth - defenderTotalIncomingDamage <= 0) {
        setComponent(WillBeDestroyed, defender, { value: true });
      }

      const attackerTerrainModifier = getModiferAtPosition(
        networkLayer,
        ArmorModifier,
        {
          x: nextPosition.x,
          y: nextPosition.y,
        } || { x: 0, y: 0 },
      );
      setComponent(TerrainArmorBonus, attacker, { value: attackerTerrainModifier });

      const defenderTerrainModifier = getModiferAtPosition(
        networkLayer,
        ArmorModifier,
        getComponentValue(Position, defender) || { x: 0, y: 0 },
      );
      setComponent(TerrainArmorBonus, defender, { value: defenderTerrainModifier });
    }
  });
}
