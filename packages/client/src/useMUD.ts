import { defineSystem, getComponentValue, getComponentValueStrict, runQuery } from "@latticexyz/recs";
import { useStore } from "./useStore";

export const useMUD = () => {
  const { networkLayer, headlessLayer, localLayer, phaserLayer, externalWalletClient, externalWorldContract } =
    useStore();

  if (networkLayer === null || headlessLayer === null || localLayer === null || phaserLayer === null) {
    throw new Error("Store not initialized");
  }

  if ((window as any).layers === undefined) {
    (window as any).layers = {
      networkLayer,
      headlessLayer,
      localLayer,
      phaserLayer,
    };

    (window as any).components = {
      ...networkLayer.components,
      ...headlessLayer.components,
      ...localLayer.components,
      ...phaserLayer.components,
    };

    (window as any).ecs = {
      getComponentValue,
      getComponentValueStrict,
      runQuery,
      defineSystem,
    };
  }

  return {
    networkLayer,
    headlessLayer,
    localLayer,
    phaserLayer,
    externalWalletClient,
    externalWorldContract,
  };
};
