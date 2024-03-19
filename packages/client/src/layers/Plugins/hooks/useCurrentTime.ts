import { useState, useEffect } from "preact/hooks";
import { PhaserLayer } from "../../Renderer/Phaser";

export function createUseCurrentTime(layer: PhaserLayer) {
  const {
    parentLayers: {
      network: {
        network: { clock },
      },
    },
  } = layer;

  return function useCurrentTime() {
    const [now, setNow] = useState(0);
    useEffect(() => {
      const sub = clock.time$.subscribe((time) => {
        setNow(time);
      });

      return () => sub.unsubscribe();
    }, []);

    return now;
  };
}
