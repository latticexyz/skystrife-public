import {
  Entity,
  Has,
  HasValue,
  Not,
  NotValue,
  defineEnterSystem,
  defineExitSystem,
  defineSystem,
  getComponentValue,
  getComponentValueStrict,
} from "@latticexyz/recs";
import { PhaserLayer } from "../..";
import { createHealthBar } from "./createHealthBar";
import { StructureTypes } from "../../../../Network";

export function createDrawHealthBarSystem(layer: PhaserLayer) {
  const {
    world,
    components: { HeaderHeight },
    parentLayers: {
      network: {
        components: { StructureType, Combat },
      },
      local: {
        components: { IncomingDamage, LocalPosition, LocalHealth, Path },
      },
      headless: {
        components: { NextPosition, Depleted },
      },
    },
  } = layer;

  const healthBars = new Map<Entity, ReturnType<typeof createHealthBar>>();

  /**
   * Health Bar Events
   * Create -> draw the current health of an entity at a specified position
   * NextPosition -> user is planning an attack and needs to see the health bar painted over the position the entity will have when combat is finished.
   *  Also, when they are committed to that combat and waiting for the transaction to resolve.
   * Has(IncomingDamage) -> draw a preview of the damage the unit would receive if combat went through
   * // NOT IMPLEMENTED
   * ReceiveDamage -> wipe incoming damage and animate the health loss
   * Gain Health -> currently, this only happens when a unit is captured. wipes incoming damage, animates health down and then back up.
   */

  // create health bar
  defineEnterSystem(
    world,
    [
      Has(LocalPosition),
      Has(LocalHealth),
      Has(Combat),
      Has(HeaderHeight),
      NotValue(StructureType, { value: StructureTypes.GoldMine }),
    ],
    ({ entity }) => {
      const headerHeight = getComponentValueStrict(HeaderHeight, entity).value;
      const bar = createHealthBar(layer, entity, 7, headerHeight);
      healthBars.set(entity, bar);

      bar.drawCurrentHealth();
    },
  );

  // Gold Bars also draw the flag denoting its owner
  // Health bars have a different xOffset
  defineEnterSystem(
    world,
    [
      Has(LocalPosition),
      Has(LocalHealth),
      Has(Combat),
      Has(HeaderHeight),
      HasValue(StructureType, { value: StructureTypes.GoldMine }),
      Not(Depleted),
    ],
    ({ entity }) => {
      const headerHeight = getComponentValueStrict(HeaderHeight, entity).value;
      const bar = createHealthBar(layer, entity, 11, headerHeight);
      healthBars.set(entity, bar);

      bar.drawCurrentHealth();
    },
  );

  // hide health bar when a unit is moving
  defineEnterSystem(world, [Has(Path), Not(NextPosition)], ({ entity }) => {
    const bar = healthBars.get(entity);
    if (!bar) return;
    bar.destroy();
  });
  defineExitSystem(world, [Has(Path), Not(NextPosition)], ({ entity }) => {
    const bar = healthBars.get(entity);
    if (!bar) return;
    bar.drawCurrentHealth();

    const incomingDamage = getComponentValue(IncomingDamage, entity);
    const damage = incomingDamage?.values.reduce((acc, v) => acc + v, 0) ?? 0;

    bar.drawIncomingDamage(damage);
  });

  defineSystem(world, [Has(NextPosition)], ({ entity }) => {
    const bar = healthBars.get(entity);
    if (!bar) return;

    bar.drawCurrentHealth();

    const incomingDamage = getComponentValue(IncomingDamage, entity);
    const damage = incomingDamage?.values.reduce((acc, v) => acc + v, 0) ?? 0;

    bar.drawIncomingDamage(damage);
  });

  defineEnterSystem(
    world,
    [Has(Depleted), HasValue(StructureType, { value: StructureTypes.GoldMine })],
    ({ entity }) => {
      const bar = healthBars.get(entity);
      if (!bar) return;

      bar.destroy();
    },
  );

  /**
   * When an entity takes damage or we want to draw a new damage preview
   */
  defineSystem(world, [Has(LocalHealth), Has(IncomingDamage)], ({ entity }) => {
    const bar = healthBars.get(entity);
    if (!bar) return;

    bar.drawCurrentHealth();

    const incomingDamage = getComponentValue(IncomingDamage, entity);
    const damage = incomingDamage?.values.reduce((acc, v) => acc + v, 0) ?? 0;

    bar.drawIncomingDamage(damage);
  });

  defineExitSystem(world, [Has(LocalPosition)], ({ entity }) => {
    const bar = healthBars.get(entity);
    if (!bar) return;

    bar.destroy();
    healthBars.delete(entity);
  });
}
