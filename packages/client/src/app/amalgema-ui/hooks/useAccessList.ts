import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has } from "@latticexyz/recs";
import { useAmalgema } from "../../../useAmalgema";
import { decodeEntity } from "@latticexyz/store-sync/recs";

export function useAccessList(matchEntity: Entity) {
  const {
    components: { MatchAllowed },
  } = useAmalgema();

  const allowedAccounts = useEntityQuery([Has(MatchAllowed)])
    .map((entity) => {
      return decodeEntity(MatchAllowed.metadata.keySchema, entity);
    })
    .filter(({ matchEntity: myMatchEntity }) => {
      return myMatchEntity === matchEntity;
    });

  return allowedAccounts;
}
