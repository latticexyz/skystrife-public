import { Entity } from "@latticexyz/recs";
import { useAmalgema } from "../../../useAmalgema";
import { useComponentValue } from "@latticexyz/react";
import { addressToEntityID } from "../../../mud/setupNetwork";
import { Hex } from "viem";

export const useHasSkyKey = (account: Hex): boolean => {
  const {
    components: { SkyKey_Balances },
  } = useAmalgema();

  const balance = useComponentValue(SkyKey_Balances, addressToEntityID(account));

  if (!balance) return false;
  return balance && balance.value > 0;
};

export const useHasSkyKeyExternalWallet = (): boolean => {
  const {
    externalWalletClient,
    components: { SkyKey_Balances },
  } = useAmalgema();

  const balance = useComponentValue(
    SkyKey_Balances,
    externalWalletClient && externalWalletClient.account
      ? addressToEntityID(externalWalletClient.account.address)
      : ("0" as Entity)
  );

  if (!balance) return false;
  return balance && balance.value > 0;
};
