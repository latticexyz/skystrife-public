import { Entity, Has, HasValue } from "@latticexyz/recs";
import { useMUD } from "../../../useMUD";
import { useEntityQuery } from "@latticexyz/react";
import { addressToEntityID } from "../../../mud/setupNetwork";

export const useCurrentPlayer = (matchEntity: Entity) => {
  const {
    networkLayer: {
      components: { Match, CreatedByAddress, Player },
    },
    headlessLayer: {
      api: { getPlayerInfo },
    },
    externalWalletClient,
  } = useMUD();

  const playerEntity = useEntityQuery([
    HasValue(CreatedByAddress, {
      value:
        externalWalletClient && externalWalletClient.account
          ? addressToEntityID(externalWalletClient.account.address)
          : "",
    }),
    HasValue(Match, { matchEntity }),
    Has(Player),
  ])[0];

  const playerInfo = getPlayerInfo(playerEntity);
  return playerInfo;
};
