import { Hex } from "viem";
import { useAmalgema } from "../../../useAmalgema";

// Mirrors Wagmi's useAccount
export function useExternalAccount(): { address: Hex | undefined } {
  const { externalWalletClient } = useAmalgema();

  if (externalWalletClient && externalWalletClient.account) {
    const { address } = externalWalletClient.account;
    return { address };
  }

  return { address: undefined };
}
