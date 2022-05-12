import mudConfig from "contracts/mud.config";
import { useEffect } from "react";
import { useAmalgema } from "../useAmalgema";

export function DevTools() {
  const networkLayer = useAmalgema();

  useEffect(() => {
    if (import.meta.env.DEV) {
      import("@latticexyz/dev-tools").then(({ mount: mountDevTools }) =>
        mountDevTools({
          config: mudConfig,
          publicClient: networkLayer.network.publicClient,
          walletClient: networkLayer.network.walletClient,
          latestBlock$: networkLayer.network.latestBlock$,
          storedBlockLogs$: networkLayer.network.storedBlockLogs$,
          worldAddress: networkLayer.network.worldContract.address,
          worldAbi: networkLayer.network.worldContract.abi,
          write$: networkLayer.network.write$,
          recsWorld: networkLayer.world,
        })
      );
    }
  }, []);

  return <></>;
}
