import { useEffect, useMemo } from "react";
import { usePromiseValue } from "../usePromiseValue";
import { HeadlessLayer } from "../layers/Headless";
import { createLocalLayer } from "../layers/Local";

export const useLocalLayer = (headlessLayer: HeadlessLayer | null) => {
  const localLayerPromise = useMemo(() => {
    if (!headlessLayer) return null;

    return createLocalLayer(headlessLayer);
  }, [headlessLayer]);

  useEffect(() => {
    return () => {
      localLayerPromise?.then((localLayer) => localLayer.world.dispose());
    };
  }, [localLayerPromise]);

  return usePromiseValue(localLayerPromise);
};
