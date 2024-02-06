import { Entity, Has, HasValue } from "@latticexyz/recs";
import { useMUD } from "../../../useMUD";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { addressToEntityID } from "../../../mud/setupNetwork";

export const useCurrentPlayer = (matchEntity: Entity) => {
  const {
    networkLayer: {
      components: { Name, Match, OwnedBy, Player },
    },
    localLayer: {
      api: { getOwnerColor },
    },
    externalWalletClient,
  } = useMUD();

  const playerEntity = useEntityQuery([
    HasValue(OwnedBy, {
      value:
        externalWalletClient && externalWalletClient.account
          ? addressToEntityID(externalWalletClient.account.address)
          : "",
    }),
    HasValue(Match, { matchEntity }),
    Has(Player),
  ])[0];

  const mainWallet = (useComponentValue(OwnedBy, playerEntity)?.value ?? "0x00") as Entity;
  const name = useComponentValue(Name, mainWallet)?.value;
  const playerColor = playerEntity
    ? getOwnerColor(playerEntity)
    : {
        name: "white",
        color: 0xffffff,
      };

  return {
    mainWallet,
    player: playerEntity,
    playerColor,
    name,
    matchEntity,
  };
};
