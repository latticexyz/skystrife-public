import { useAmalgema } from "../../../useAmalgema";
import { Hex, formatEther, numberToHex, padHex, parseEther } from "viem";
import { addressToEntityID } from "../../../mud/setupNetwork";
import { useComponentValue } from "@latticexyz/react";

export const MINIMUM_BALANCE = parseEther("0.000006");
export const LOW_BALANCE_THRESHOLD = parseEther("0.0005");
export const RECOMMENDED_BALANCE = parseEther("0.005");

const zeroAddress = padHex(numberToHex(0, { size: 4 }), { size: 20, dir: "right" });

export function useBalance(address: Hex) {
  const {
    components: { WalletBalance },
  } = useAmalgema();

  const addressEntity = addressToEntityID(address);
  const balance = useComponentValue(WalletBalance, addressEntity)?.value ?? 0n;

  return {
    value: balance,
    formatted: parseFloat(formatEther(balance)).toFixed(6),
    unplayable: balance < MINIMUM_BALANCE,
    danger: balance < LOW_BALANCE_THRESHOLD,
    belowRecommended: balance < RECOMMENDED_BALANCE,
  };
}

export function useBurnerBalance() {
  const {
    network: { walletClient },
  } = useAmalgema();

  return useBalance(walletClient?.account?.address ?? zeroAddress);
}

export function useMainWalletBalance() {
  const { externalWalletClient } = useAmalgema();

  return useBalance(externalWalletClient?.account?.address ?? zeroAddress);
}
