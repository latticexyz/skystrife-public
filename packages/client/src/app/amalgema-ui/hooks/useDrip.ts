import { useEffect } from "react";
import { useAmalgema } from "../../../useAmalgema";
import { drip } from "../../../mud/faucet";
import { useExternalAccount } from "./useExternalAccount";

export function useDrip() {
  const {
    network: {
      publicClient,
      networkConfig: { faucetServiceUrl },
    },
  } = useAmalgema();

  const { address } = useExternalAccount();

  useEffect(() => {
    if (address && faucetServiceUrl) {
      drip(address, faucetServiceUrl, publicClient);
    }
  }, [address, faucetServiceUrl, publicClient]);
}
