import { useEffect } from "react";
import { HeadlessLayer } from "../layers/Headless";
import { useStore } from "../useStore";
import { PhaserLayer } from "./PhaserLayer";
import { useLocalLayer } from "./useLocalLayer";

type Props = {
  headlessLayer: HeadlessLayer | null;
};

export const LocalLayer = ({ headlessLayer }: Props) => {
  const localLayer = useLocalLayer(headlessLayer);

  useEffect(() => {
    if (localLayer) {
      useStore.setState({ localLayer });
    }
  }, [localLayer]);

  return <PhaserLayer localLayer={localLayer} />;
};
