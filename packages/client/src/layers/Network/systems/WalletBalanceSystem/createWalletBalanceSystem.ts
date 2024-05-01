import { useStore } from "../../../../useStore";
import { NetworkLayer } from "../../types";

export function createWalletBalanceSystem(layer: NetworkLayer) {
  const {
    network: { walletClient },
    utils: { refreshBalance },
  } = layer;

  setInterval(async () => {
    const { externalWalletClient } = useStore.getState();
    if (externalWalletClient?.account) {
      const address = externalWalletClient.account.address;
      refreshBalance(address);
    }

    if (walletClient?.account) {
      const address = walletClient.account.address;
      refreshBalance(address);
    }
  }, 10_000);
}
