import { Has, UpdateType, defineSystem } from "@latticexyz/recs";
import { PhaserLayer, RenderDepth } from "../../types";

export function createDepthSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { StructureType, UnitType },
      },
      local: {
        components: { LocalPosition },
      },
    },
    api: { setDepth },
  } = layer;

  defineSystem(world, [Has(LocalPosition), Has(StructureType)], ({ entity, type }) => {
    if (type === UpdateType.Exit) return;

    setDepth(entity, RenderDepth.Foreground2);
  });

  defineSystem(world, [Has(LocalPosition), Has(UnitType)], ({ entity, type }) => {
    if (type === UpdateType.Exit) return;

    setDepth(entity, RenderDepth.Foreground3);
  });
}
