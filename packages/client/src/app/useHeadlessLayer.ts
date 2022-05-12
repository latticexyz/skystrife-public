import { useEffect, useMemo } from "react";
import { usePromiseValue } from "../usePromiseValue";
import { NetworkLayer } from "../layers/Network";
import { createHeadlessLayer } from "../layers/Headless";

export const useHeadlessLayer = (networkLayer: NetworkLayer | null) => {
  const headlessLayerPromise = useMemo(() => {
    if (!networkLayer) return null;

    return createHeadlessLayer(networkLayer);
  }, [networkLayer]);

  useEffect(() => {
    return () => {
      headlessLayerPromise?.then((headlessLayer) => headlessLayer.world.dispose());
    };
  }, [headlessLayerPromise]);

  return usePromiseValue(headlessLayerPromise);
};
