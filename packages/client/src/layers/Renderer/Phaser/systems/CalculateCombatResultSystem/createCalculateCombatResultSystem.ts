import {
  defineComponent,
  defineSyncSystem,
  defineSystem,
  getComponentValue,
  getComponentValueStrict,
  Has,
  removeComponent,
  setComponent,
  Type,
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
    () => ({ value: 0 }),
    { runOnInit: true }
  );

  const PreviouslySetIncomingDamage = defineComponent(
    world,
    {
      attacker: Type.OptionalEntity,
      defender: Type.OptionalEntity,
    },
    { id: "PreviouslySetIncomingDamage" }
  );

  defineSyncSystem(
    world,
    [Has(Combat)],
    () => PreviouslySetIncomingDamage,
    () => ({
      attacker: undefined,
      defender: undefined,
    }),
    { runOnInit: true }
  );

  defineSystem(world, [Has(NextPosition)], ({ entity, type }) => {
    const prev = getComponentValue(PreviouslySetIncomingDamage, entity);
    if (prev) {
      const attacker = prev.attacker;
      const defender = prev.defender;

      if (attacker) {
        setComponent(IncomingDamage, attacker, { value: 0 });
        setComponent(WillBeDestroyed, attacker, { value: false });
        removeComponent(TerrainArmorBonus, attacker);
      }
      if (defender) {
        setComponent(IncomingDamage, defender, { value: 0 });
        setComponent(WillBeDestroyed, defender, { value: false });
        removeComponent(TerrainArmorBonus, defender);
      }
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

      setComponent(IncomingDamage, attacker, { value: combatResult.defenderDamage * 1000 });
      setComponent(IncomingDamage, defender, { value: combatResult.attackerDamage * 1000 });

      const attackerHealth = (getComponentValue(Combat, attacker)?.health ?? 0) / 1000;
      const defenderHealth = (getComponentValue(Combat, defender)?.health ?? 0) / 1000;

      if (attackerHealth - combatResult.defenderDamage <= 0) {
        setComponent(WillBeDestroyed, attacker, { value: true });
      }

      if (defenderHealth - combatResult.attackerDamage <= 0) {
        setComponent(WillBeDestroyed, defender, { value: true });
      }

      const attackerTerrainModifier = getModiferAtPosition(
        networkLayer,
        ArmorModifier,
        {
          x: nextPosition.x,
          y: nextPosition.y,
        } || { x: 0, y: 0 }
      );
      setComponent(TerrainArmorBonus, attacker, { value: attackerTerrainModifier });

      const defenderTerrainModifier = getModiferAtPosition(
        networkLayer,
        ArmorModifier,
        getComponentValue(Position, defender) || { x: 0, y: 0 }
      );
      setComponent(TerrainArmorBonus, defender, { value: defenderTerrainModifier });

      setComponent(PreviouslySetIncomingDamage, entity, {
        attacker,
        defender,
      });
    }
  });
}
