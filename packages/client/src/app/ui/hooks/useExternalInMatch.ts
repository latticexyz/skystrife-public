import { Entity, Has, HasValue } from "@latticexyz/recs";
import { useMUD } from "../../../useMUD";
import { useEntityQuery } from "@latticexyz/react";
import { addressToEntityID } from "../../../mud/setupNetwork";
import { useExternalAccount } from "./useExternalAccount";

export const useExternalInMatch = (matchEntity: Entity) => {
  const {
    networkLayer: {
      components: { Match, OwnedBy, Player },
    },
  } = useMUD();

  const { address } = useExternalAccount();

  const players = useEntityQuery([
    Has(Player),
    HasValue(Match, { matchEntity }),
    HasValue(OwnedBy, {
      value: address ? addressToEntityID(address) : "",
    }),
  ]);

  return players.length > 0;
};
