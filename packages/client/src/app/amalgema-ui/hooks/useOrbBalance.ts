import { Entity } from "@latticexyz/recs";
import { addressToEntityID } from "../../../mud/setupNetwork";
import { useAmalgema } from "../../../useAmalgema";
import { useComponentValue } from "@latticexyz/react";

export function useOrbBalance() {
  const {
    externalWalletClient,
    components: { Orb_Balances },
  } = useAmalgema();

  const balance = useComponentValue(
    Orb_Balances,
    externalWalletClient && externalWalletClient.account
      ? addressToEntityID(externalWalletClient.account.address)
      : ("0" as Entity)
  );

  return balance?.value || 0n;
}
