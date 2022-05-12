import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { compact } from "lodash";
import { useMUD } from "../../../useMUD";

export const useAllPlayerDetails = (matchEntity?: Entity) => {
  const {
    networkLayer: {
      components: { Player, Match },
    },
    localLayer: {
      api: { getPlayerInfo },
    },
  } = useMUD();

  const allPlayers = useEntityQuery([Has(Player), ...(matchEntity ? [HasValue(Match, { matchEntity })] : [])]);
  const playerData = compact(allPlayers.map((player) => getPlayerInfo(player)));

  return playerData;
};
