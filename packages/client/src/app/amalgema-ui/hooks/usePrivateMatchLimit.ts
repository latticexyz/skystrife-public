import { Entity } from "@latticexyz/recs";
import { useComponentValue } from "@latticexyz/react";
import { useAmalgema } from "../../../useAmalgema";
import { encodeEntity, singletonEntity } from "@latticexyz/store-sync/recs";
import { useSkyPoolConfig } from "./useSkyPoolConfig";
import { Hex } from "viem";
import { useExternalAccount } from "./useExternalAccount";

export function usePrivateMatchLimit() {
  const {
    components: { SeasonPassPrivateMatchLimit, PrivateMatchesCreated },
  } = useAmalgema();

  const { address } = useExternalAccount();
  const skyPoolConfig = useSkyPoolConfig();

  const privateMatchCreatedEntity =
    address && skyPoolConfig?.seasonPassToken
      ? encodeEntity(PrivateMatchesCreated.metadata.keySchema, {
          holderAddress: address,
          seasonPassToken: skyPoolConfig.seasonPassToken as Hex,
        })
      : ("0x0" as Entity);

  const seasonPassPrivateMatchLimit = useComponentValue(SeasonPassPrivateMatchLimit, singletonEntity)?.value;
  const limit = seasonPassPrivateMatchLimit ?? 0n;
  const created = useComponentValue(PrivateMatchesCreated, privateMatchCreatedEntity)?.value ?? 0n;

  return { limit, created };
}
