import { useEffect, useMemo } from "react";
import { createNetworkLayer } from "../layers/Network/createNetworkLayer";
import { usePromiseValue } from "../usePromiseValue";
import { getNetworkConfig } from "../mud/getBrowserNetworkConfig";

export const useNetworkLayer = () => {
  const networkLayerPromise = useMemo(async () => {
    return createNetworkLayer(await getNetworkConfig());
  }, []);

  useEffect(() => {
    return () => {
      networkLayerPromise.then((networkLayer) => networkLayer.network.world.dispose());
    };
  }, [networkLayerPromise]);

  return usePromiseValue(networkLayerPromise);
};
