import { Has, getComponentValue } from "@latticexyz/recs";
import { PhaserLayer } from "../../Renderer/Phaser";
import { useEntityQuery } from "./useEntityQuery";

export function createUseTransactions(layer: PhaserLayer) {
  const {
    parentLayers: {
      network: {
        components: { Transaction },
      },
    },
  } = layer;

  return function useTransactions() {
    const txEntities = useEntityQuery([Has(Transaction)]);

    return txEntities.map((txEntity) => {
      const txData = getComponentValue(Transaction, txEntity);

      return {
        txEntity,
        ...(txData ?? {}),
      };
    });
  };
}
