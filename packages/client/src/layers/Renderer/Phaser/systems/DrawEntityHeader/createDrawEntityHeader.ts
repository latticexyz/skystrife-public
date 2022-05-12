import { Has, getComponentValueStrict, defineSystem, Not, setComponent, UpdateType } from "@latticexyz/recs";
import { StructureTypes } from "../../../../Network";
import { PhaserLayer } from "../../types";
import { drawGoldBar, drawHealthBar, drawPlayerColorBanner } from "./drawingUtils";
import { UNIT_OFFSET } from "../../../../Local/constants";

export function createDrawEntityHeader(layer: PhaserLayer) {
  const {
    world,
    components: { HeaderHeight, IncomingDamage },
    parentLayers: {
      network: {
        components: { Tier, OwnedBy, Capturable, StructureType, Combat, ChargeCap },
      },
      local: {
        components: { LocalPosition, LocalHealth, Path },
      },
      headless: {
        components: { InCurrentMatch },
      },
    },
  } = layer;

  defineSystem(world, [Has(Tier), Has(InCurrentMatch)], ({ entity }) => {
    const tier = getComponentValueStrict(Tier, entity).value;
    const yOffset = 3 - tier * 2 - UNIT_OFFSET;
    setComponent(HeaderHeight, entity, { value: yOffset });
  });

  defineSystem(world, [Has(StructureType), Has(InCurrentMatch)], ({ entity }) => {
    const structureType = getComponentValueStrict(StructureType, entity).value;

    let yOffset = 0;
    if ([StructureTypes.SpawnSettlement].includes(structureType)) {
      yOffset = -15;
    } else if ([StructureTypes.Settlement].includes(structureType)) {
      yOffset = -13;
    } else {
      yOffset = -3;
    }

    setComponent(HeaderHeight, entity, { value: yOffset });
  });

  // Player Color Banner
  defineSystem(world, [Has(LocalPosition), Has(Capturable), Has(HeaderHeight), Not(Path)], ({ entity, type }) => {
    const headerHeight = getComponentValueStrict(HeaderHeight, entity).value;
    drawPlayerColorBanner(layer, entity, type, headerHeight);
  });

  defineSystem(world, [Has(LocalPosition), Has(OwnedBy), Has(HeaderHeight), Not(Path)], ({ entity, type }) => {
    const headerHeight = getComponentValueStrict(HeaderHeight, entity).value;
    drawPlayerColorBanner(layer, entity, type, headerHeight);

    if (type === UpdateType.Enter) {
      // HUGE HACK TO GET SPAWNS PAINTED COME BACK TO THIS
      setTimeout(() => {
        const headerHeight = getComponentValueStrict(HeaderHeight, entity).value;
        drawPlayerColorBanner(layer, entity, type, headerHeight);
      }, 1_000);
    }
  });

  // Health Bar Systems
  defineSystem(
    world,
    [Has(LocalPosition), Has(LocalHealth), Has(Combat), Has(HeaderHeight), Has(IncomingDamage), Not(Path)],
    (update) => {
      const headerHeight = getComponentValueStrict(HeaderHeight, update.entity).value;
      drawHealthBar(layer, update, 7, headerHeight);
    }
  );

  // Gold Bar Systems
  defineSystem(world, [Has(LocalPosition), Has(HeaderHeight), Has(ChargeCap)], (update) => {
    const headerHeight = getComponentValueStrict(HeaderHeight, update.entity).value;
    drawGoldBar(layer, update, 7, headerHeight + 3);
  });
}
