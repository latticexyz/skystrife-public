import { Has, HasValue } from "@latticexyz/recs";
import { PhaserLayer } from "../../Renderer/Phaser";
import { useEntityQuery } from "./useEntityQuery";

export function createUsePlayersInMatch(phaserLayer: PhaserLayer) {
  const {
    parentLayers: {
      network: {
        components: { Player, Match },
        network: { matchEntity },
      },
    },
  } = phaserLayer;

  return function usePlayersInMatch() {
    const allPlayers = useEntityQuery([Has(Player), ...(matchEntity ? [HasValue(Match, { matchEntity })] : [])]);

    return allPlayers;
  };
}
