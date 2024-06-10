import { getComponentValue } from "@latticexyz/recs";
import { addressToEntityID } from "client/src/mud/setupNetwork";
import { createSkyStrife } from "headless-client/src/createSkyStrife";

export function hasSeasonPass(skyStrife: Awaited<ReturnType<typeof createSkyStrife>>) {
  const {
    network: { walletClient },
    components: { SeasonPass_Balances },
  } = skyStrife.networkLayer;

  const balance = getComponentValue(SeasonPass_Balances, addressToEntityID(walletClient.account.address));

  if (!balance) return false;
  return balance && balance.value > 0;
}
