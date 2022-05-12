import mudConfig from "contracts/mud.config";
import { useEffect } from "react";
import { useMUD } from "../../../useMUD";

export function DevTools() {
  const { networkLayer } = useMUD();

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
