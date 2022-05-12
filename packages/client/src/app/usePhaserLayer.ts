import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPhaserLayer } from "../layers/Renderer/Phaser";
import { gameConfig } from "../layers/Renderer/Phaser/gameConfig";
import useResizeObserver, { ResizeHandler } from "use-resize-observer";
import { throttle } from "lodash";
import { usePromiseValue } from "../usePromiseValue";
import { LocalLayer } from "../layers/Local";

const createContainer = () => {
  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.height = "100%";
  container.style.pointerEvents = "all";
  return container;
};

type Props = {
  localLayer: LocalLayer | null;
};

export const usePhaserLayer = ({ localLayer }: Props) => {
  const parentRef = useRef<HTMLElement | null>(null);
  const [{ width, height }, setSize] = useState({ width: 0, height: 0 });

  const { phaserLayerPromise, container } = useMemo(() => {
    if (!localLayer) return { phaserLayerPromise: null, container: null };

    const container = createContainer();
    if (parentRef.current) {
      parentRef.current.appendChild(container);
    }
    return {
      container,
      phaserLayerPromise: createPhaserLayer(localLayer, {
        ...gameConfig,
        scale: {
          ...gameConfig.scale,
          parent: container,
          // Phaser's default resize handling isn't great, so we'll do our own
          // TODO: make a Phaser PR for this?
          mode: Phaser.Scale.NONE,
          width,
          height,
        },
      }),
    };

    // We don't want width/height to recreate phaser layer, so we ignore linter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localLayer]);

  useEffect(() => {
    return () => {
      phaserLayerPromise?.then((phaserLayer) => phaserLayer.world.dispose());
      container?.remove();
    };
  }, [container, phaserLayerPromise]);

  const phaserLayer = usePromiseValue(phaserLayerPromise);

  const onResize = useMemo<ResizeHandler>(() => {
    return throttle(({ width, height }) => {
      setSize({ width: width ?? 0, height: height ?? 0 });
    }, 500);
  }, []);

  useResizeObserver({
    ref: container,
    onResize,
  });

  // useEffect(() => {
  //   if (!phaserLayer) return;
  //   phaserLayer.game.scale.resize(width, height);
  // }, [width, height, phaserLayer]);

  const ref = useCallback(
    (el: HTMLElement | null) => {
      parentRef.current = el;
      if (container) {
        if (parentRef.current) {
          parentRef.current.appendChild(container);
        } else {
          container.remove();
        }
      }
    },
    [container]
  );

  return useMemo(() => ({ ref, phaserLayer }), [ref, phaserLayer]);
};
