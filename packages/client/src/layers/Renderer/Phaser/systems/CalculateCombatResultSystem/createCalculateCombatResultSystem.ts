import {
  defineComponent,
  defineSyncSystem,
  defineSystem,
  getComponentValue,
  getComponentValueStrict,
  Has,
  setComponent,
  Type,
  UpdateType,
} from "@latticexyz/recs";
import { calculateCombatResult } from "../../../../Headless/utils";
import { PhaserLayer } from "../../types";

export function createCalculateCombatResultSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { Combat },
      },
      headless: {
        components: { NextPosition },
      },
    },
    components: { IncomingDamage },
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

      if (attacker) setComponent(IncomingDamage, attacker, { value: 0 });
      if (defender) setComponent(IncomingDamage, defender, { value: 0 });
    }

    if (type === UpdateType.Exit) {
      return;
    }

    const nextPosition = getComponentValueStrict(NextPosition, entity);
    if (nextPosition.intendedTarget) {
      const defender = nextPosition.intendedTarget;
      const attacker = entity;

      const combatResult = calculateCombatResult(layer.parentLayers.network, attacker, defender);

      setComponent(IncomingDamage, attacker, { value: combatResult.defenderDamage * 1000 });
      setComponent(IncomingDamage, defender, { value: combatResult.attackerDamage * 1000 });

      setComponent(PreviouslySetIncomingDamage, entity, {
        attacker,
        defender,
      });
    }
  });
}
