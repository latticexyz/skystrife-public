import { Has, getComponentValueStrict, defineSystem, Not, setComponent, HasValue, NotValue } from "@latticexyz/recs";
import { StructureTypes } from "../../../../Network";
import { PhaserLayer } from "../../types";
import { drawGoldBar, drawHealthBar, drawPlayerColorBanner } from "./drawingUtils";

export function createDrawEntityHeader(layer: PhaserLayer) {
  const {
    world,
    components: { HeaderHeight, IncomingDamage },
    parentLayers: {
      network: {
        components: { StructureType, Combat, ChargeCap, OwnedBy },
      },
      local: {
        components: { LocalPosition, LocalHealth, Path },
      },
      headless: {
        components: { InCurrentMatch, NextPosition, Depleted },
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

  // Health Bar Systems
  defineSystem(
    world,
    [
      Has(LocalPosition),
      Has(LocalHealth),
      Has(Combat),
      Has(HeaderHeight),
      Has(IncomingDamage),
      NotValue(StructureType, { value: StructureTypes.GoldMine }),
      Not(Path),
      Not(NextPosition),
    ],
    (update) => {
      const headerHeight = getComponentValueStrict(HeaderHeight, update.entity).value;
      drawHealthBar(layer, update, 7, headerHeight);
    },
  );

  defineSystem(
    world,
    [
      Has(LocalPosition),
      Has(LocalHealth),
      Has(Combat),
      Has(HeaderHeight),
      Has(IncomingDamage),
      Has(NextPosition),
      NotValue(StructureType, { value: StructureTypes.GoldMine }),
    ],
    (update) => {
      const headerHeight = getComponentValueStrict(HeaderHeight, update.entity).value;
      drawHealthBar(layer, update, 7, headerHeight);
    },
  );

  defineSystem(
    world,
    [
      Has(LocalPosition),
      Has(LocalHealth),
      Has(Combat),
      Has(HeaderHeight),
      Has(IncomingDamage),
      HasValue(StructureType, { value: StructureTypes.GoldMine }),
    ],
    (update) => {
      const headerHeight = getComponentValueStrict(HeaderHeight, update.entity).value;
      drawHealthBar(layer, update, 11, headerHeight);
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
