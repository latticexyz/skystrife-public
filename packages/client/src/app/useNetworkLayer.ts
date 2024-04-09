import { useEffect, useMemo } from "react";
import { createNetworkLayer } from "../layers/Network/createNetworkLayer";
import { usePromiseValue } from "../usePromiseValue";
import { NetworkConfig } from "../mud/utils";

export const useNetworkLayer = (networkConfig: NetworkConfig) => {
  const networkLayerPromise = useMemo(async () => {
    return createNetworkLayer(networkConfig);
  }, [networkConfig]);

  useEffect(() => {
    return () => {
      networkLayerPromise.then((networkLayer) => networkLayer.network.world.dispose());
    };
  }, [networkLayerPromise]);

  return usePromiseValue(networkLayerPromise);
};
