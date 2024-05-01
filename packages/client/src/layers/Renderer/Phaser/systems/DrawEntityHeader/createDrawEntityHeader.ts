import { Has, getComponentValueStrict, defineSystem, Not, setComponent, HasValue, NotValue } from "@latticexyz/recs";
import { StructureTypes } from "../../../../Network";
import { PhaserLayer } from "../../types";
import { drawGoldBar, drawPlayerColorBanner } from "./drawingUtils";
import { createDrawHealthBarSystem } from "./createDrawHealthBarSystem";

export function createDrawEntityHeader(layer: PhaserLayer) {
  const {
    world,
    components: { HeaderHeight },
    parentLayers: {
      network: {
        components: { StructureType, ChargeCap, OwnedBy },
      },
      local: {
        components: { LocalPosition },
      },
      headless: {
        components: { InCurrentMatch, Depleted },
      },
    },
  } = layer;

  defineSystem(world, [Has(InCurrentMatch)], ({ entity }) => {
    const yOffset = -11;
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

  // Health Bar Systems
  createDrawHealthBarSystem(layer);

  // Player Color Banner
  defineSystem(
    world,
    [
      Has(LocalPosition),
      Not(OwnedBy),
      HasValue(StructureType, { value: StructureTypes.GoldMine }),
      Not(Depleted),
      Has(HeaderHeight),
    ],
    ({ entity, type }) => {
      const headerHeight = getComponentValueStrict(HeaderHeight, entity).value;
      drawPlayerColorBanner(layer, entity, type, headerHeight);
    },
  );

  defineSystem(
    world,
    [
      Has(LocalPosition),
      Has(OwnedBy),
      HasValue(StructureType, { value: StructureTypes.GoldMine }),
      Not(Depleted),
      Has(HeaderHeight),
    ],
    ({ entity, type }) => {
      const headerHeight = getComponentValueStrict(HeaderHeight, entity).value;
      drawPlayerColorBanner(layer, entity, type, headerHeight);
    },
  );

  // Gold Bar Systems
  defineSystem(
    world,
    [
      Has(LocalPosition),
      Has(HeaderHeight),
      Has(ChargeCap),
      Not(Depleted),
      NotValue(StructureType, { value: StructureTypes.GoldMine }),
    ],
    (update) => {
      const headerHeight = getComponentValueStrict(HeaderHeight, update.entity).value;
      drawGoldBar(layer, update, 7, headerHeight + 3);
    },
  );

  defineSystem(
    world,
    [
      Has(LocalPosition),
      Has(HeaderHeight),
      Has(ChargeCap),
      HasValue(StructureType, { value: StructureTypes.GoldMine }),
      Not(Depleted),
    ],
    (update) => {
      const headerHeight = getComponentValueStrict(HeaderHeight, update.entity).value;
      drawGoldBar(layer, update, 11, headerHeight + 3);
    },
  );
}
