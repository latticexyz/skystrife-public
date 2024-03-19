import {
  defineEnterSystem,
  defineSystem,
  defineUpdateSystem,
  Has,
  HasValue,
  runQuery,
  setComponent,
  UpdateType,
} from "@latticexyz/recs";
import { PhaserLayer } from "../../types";
import { decodeMatchEntity } from "../../../../../decodeMatchEntity";

/**
 * The HueTint system handles setting a "hueTint" pipeline data on game objects having a hue tint
 */
export function createHueTintSystem(layer: PhaserLayer) {
  const {
    world,
    components: { HueTint },
    parentLayers: {
      network: {
        components: { OwnedBy, Player, Name, Capturable },
        network: { matchEntity },
      },
      local: {
        api: { getOwnerColor },
      },
      headless: {
        components: { InCurrentMatch },
      },
    },
  } = layer;

  defineSystem(world, [Has(Player), Has(Name)], ({ entity, type }) => {
    if (type === UpdateType.Exit) return;

    const ownedEntities = runQuery([HasValue(OwnedBy, { value: decodeMatchEntity(entity).entity })]);

    const color = getOwnerColor(entity, matchEntity);
    for (const e of ownedEntities) {
      setComponent(HueTint, e, { value: color.name });
    }
  });

  defineEnterSystem(world, [Has(OwnedBy), Has(InCurrentMatch)], ({ entity }) => {
    const color = getOwnerColor(entity, matchEntity);
    if (!color) return;

    setComponent(HueTint, entity, { value: color.name });

    // HUGE HACK TO GET SPAWNS PAINTED COME BACK TO THIS
    setTimeout(() => {
      const color = getOwnerColor(entity, matchEntity);
      if (!color) return;

      setComponent(HueTint, entity, { value: color.name });
    }, 1_000);
  });

  defineUpdateSystem(world, [Has(OwnedBy), Has(Capturable)], ({ entity }) => {
    const color = getOwnerColor(entity, matchEntity);
    if (!color) return;

    setComponent(HueTint, entity, { value: color.name });
  });

  defineEnterSystem(world, [Has(Capturable), Has(InCurrentMatch)], ({ entity }) => {
    setComponent(HueTint, entity, { value: "white" });
  });
}
