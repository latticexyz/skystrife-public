import { useMemo } from "react";
import { useAmalgema } from "../../../useAmalgema";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useComponentValue } from "@latticexyz/react";

export function useSeasonPassPrice(atTime: bigint) {
  const {
    components: { SeasonPassConfig, SeasonPassLastSaleAt },
  } = useAmalgema();

  const config = useComponentValue(SeasonPassConfig, singletonEntity);
  const lastSaleAt = useComponentValue(SeasonPassLastSaleAt, singletonEntity);

  const price = useMemo(() => {
    if (!config || !lastSaleAt) return 0n;

    const { startingPrice, rate, minPrice } = config;
    const timeSinceLastSale = atTime - lastSaleAt.lastSaleAt;
    const decrease = ((startingPrice * rate) / 10_000_000_000n) * timeSinceLastSale;

    if (startingPrice > decrease) {
      const newPrice = startingPrice - decrease;
      if (newPrice > minPrice) {
        return startingPrice - decrease;
      } else {
        return minPrice;
      }
    } else {
      return minPrice;
    }
  }, [config, lastSaleAt, atTime]);

  return price;
}
