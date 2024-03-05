import { Has } from "@latticexyz/recs";
import { useEntityQuery } from "./useEntityQuery";
import { PhaserLayer } from "../../Renderer/Phaser";

/**
 * Returns the currently selected entity, if any.
 */
export function createUseSelectedEntity(phaserLayer: PhaserLayer) {
  const {
    parentLayers: {
      local: {
        components: { Selected },
      },
    },
  } = phaserLayer;

  return function useSelectedEntity() {
    return useEntityQuery([Has(Selected)])[0];
  };
}
