import { Entity, Has, HasValue } from "@latticexyz/recs";
import { useMUD } from "../../../useMUD";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { addressToEntityID } from "../../../mud/setupNetwork";

export const useCurrentPlayer = (matchEntity: Entity) => {
  const {
    networkLayer: {
      components: { Name, Match, CreatedByAddress, Player },
    },
    headlessLayer: {
      api: { getOwnerColor },
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

  const mainWallet = (useComponentValue(CreatedByAddress, playerEntity)?.value ?? "0x00") as Entity;
  const name = useComponentValue(Name, mainWallet)?.value;
  const playerColor = playerEntity
    ? getOwnerColor(playerEntity, matchEntity)
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
