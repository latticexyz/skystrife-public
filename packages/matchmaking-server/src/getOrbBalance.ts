import { createSkyStrife } from "headless-client/src/createSkyStrife";
import { getComponentValue, Entity } from "@latticexyz/recs";
import { addressToEntityID } from "client/src/mud/setupNetwork";

export const getOrbBalance = (skyStrife: Awaited<ReturnType<typeof createSkyStrife>>) => {
  const {
    network: { walletClient },
    components: { Orb_Balances },
  } = skyStrife.networkLayer;

  const balance = getComponentValue(
    Orb_Balances,
    walletClient && walletClient.account ? addressToEntityID(walletClient.account.address) : ("0" as Entity),
  );

  return balance?.value || 0n;
};
