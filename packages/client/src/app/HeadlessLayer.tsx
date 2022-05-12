import { useEffect } from "react";
import { NetworkLayer } from "../layers/Network";
import { useStore } from "../useStore";
import { LocalLayer } from "./LocalLayer";
import { useHeadlessLayer } from "./useHeadlessLayer";

type Props = {
  networkLayer: NetworkLayer | null;
};

export const HeadlessLayer = ({ networkLayer }: Props) => {
  const headlessLayer = useHeadlessLayer(networkLayer);

  useEffect(() => {
    if (headlessLayer) {
      useStore.setState({ headlessLayer });
    }
  }, [headlessLayer]);

  return <LocalLayer headlessLayer={headlessLayer} />;
};
