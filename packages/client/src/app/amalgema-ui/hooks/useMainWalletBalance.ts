import { useBalance } from "wagmi";
import { useAmalgema } from "../../../useAmalgema";

export function useMainWalletBalance() {
  const { externalWalletClient } = useAmalgema();

  const { data } = useBalance({
    address: externalWalletClient?.account?.address,
    watch: true,
    staleTime: 1000,
  });

  return {
    ...data,
  };
}
