import { useBalance } from "wagmi";
import { useAmalgema } from "../../../useAmalgema";
import { parseEther } from "viem";

export const LOW_BALANCE_THRESHOLD = parseEther("0.0005");
export const DANGER_BALANCE_THRESHOLD = parseEther("0.000002");

export function useBurnerBalance() {
  const {
    network: { walletClient },
  } = useAmalgema();

  const { data } = useBalance({
    address: walletClient.account.address,
    watch: true,
    staleTime: 1000,
  });

  const balance = data?.value ?? 0n;

  return {
    ...data,
    belowMinimum: balance < LOW_BALANCE_THRESHOLD,
    belowDanger: balance < DANGER_BALANCE_THRESHOLD,
  };
}
