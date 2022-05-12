import { useEffect } from "react";
import { useStore } from "../useStore";
import { usePhaserLayer } from "./usePhaserLayer";
import { LocalLayer } from "../layers/Local";

// We isolate the `usePhaserHook` hook in its own component so that HMR
// somewhere in the Phaser layer doesn't trigger the whole app to re-render.

type Props = {
  localLayer: LocalLayer | null;
};

export const PhaserLayer = ({ localLayer }: Props) => {
  const { ref: phaserRef, phaserLayer } = usePhaserLayer({ localLayer });

  useEffect(() => {
    if (phaserLayer) {
      useStore.setState({ phaserLayer });
    }
  }, [phaserLayer]);

  return <div ref={phaserRef} style={{ width: "100%", height: "100%" }} />;
};
