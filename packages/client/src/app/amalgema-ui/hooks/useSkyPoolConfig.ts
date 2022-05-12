import { Has } from "@latticexyz/recs";
import { useAmalgema } from "../../../useAmalgema";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";

export function useSkyPoolConfig() {
  const {
    network: {
      components: { SkyPoolConfig },
    },
  } = useAmalgema();

  const skypoolEntity = useEntityQuery([Has(SkyPoolConfig)])[0];
  const skypoolConfig = useComponentValue(SkyPoolConfig, skypoolEntity);

  return skypoolConfig;
}
