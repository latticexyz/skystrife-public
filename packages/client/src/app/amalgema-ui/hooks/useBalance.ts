import { useAmalgema } from "../../../useAmalgema";
import { Hex, formatEther, parseEther } from "viem";
import { getBalance } from "viem/actions";
import { useCurrentTime } from "./useCurrentTime";
import { useEffect, useState } from "react";

export const LOW_BALANCE_THRESHOLD = parseEther("0.0005");
export const DANGER_BALANCE_THRESHOLD = parseEther("0.000002");

export function useBalance(address: Hex) {
  const {
    network: { walletClient },
  } = useAmalgema();

  const [balance, setBalance] = useState(0n);
  const currentTime = useCurrentTime();
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balance = await getBalance(walletClient, {
          address,
        });
        setBalance(balance);
      } catch (e) {
        /* empty */
      }
    };
    fetchBalance();
  }, [walletClient, currentTime, address]);

  return {
    value: balance,
    formatted: parseFloat(formatEther(balance)).toFixed(6),
    belowMinimum: balance < LOW_BALANCE_THRESHOLD,
    belowDanger: balance < DANGER_BALANCE_THRESHOLD,
  };
}

export function useBurnerBalance() {
  const {
    network: { walletClient },
  } = useAmalgema();

  return useBalance(walletClient.account.address);
}

export function useMainWalletBalance() {
  const { externalWalletClient } = useAmalgema();

  return useBalance(externalWalletClient?.account?.address ?? "0x0");
}
