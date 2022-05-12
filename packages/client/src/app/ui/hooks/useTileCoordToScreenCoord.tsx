import { useEffect, useMemo, useState } from "react";
import { useMUD } from "../../../useMUD";
import { Coord, tileCoordToPixelCoord } from "phaserx";
import { TILE_HEIGHT, TILE_WIDTH } from "../../../layers/Renderer/Phaser/phaserConstants";

function worldCoordToScreenCoord(position: Coord, camera: Phaser.Cameras.Scene2D.Camera) {
  return {
    x: (position.x - camera.worldView.x) * camera.zoom,
    y: (position.y - camera.worldView.y) * camera.zoom,
  };
}

export function useTileCoordToScreenCoord(tileCoord: { x: number; y: number }) {
  const {
    phaserLayer: {
      scenes: {
        Main: {
          camera: { worldView$, phaserCamera },
        },
      },
    },
  } = useMUD();

  const [screenPosition, setScreenPosition] = useState({ x: 0, y: 0 });
  const worldPosition = useMemo(
    () => tileCoordToPixelCoord({ x: tileCoord.x, y: tileCoord.y }, TILE_WIDTH, TILE_HEIGHT),
    [tileCoord.x, tileCoord.y]
  );

  useEffect(() => {
    const refreshScreenPosition = () => {
      const newScreenPosition = worldCoordToScreenCoord({ x: worldPosition.x, y: worldPosition.y }, phaserCamera);

      if (screenPosition.x === newScreenPosition.x && screenPosition.y === newScreenPosition.y) return;

      setScreenPosition(newScreenPosition);
    };

    const sub = worldView$.subscribe(() => {
      refreshScreenPosition();
    });

    return () => {
      sub.unsubscribe();
    };
  }, [phaserCamera, screenPosition.x, screenPosition.y, worldPosition.x, worldPosition.y, worldView$]);

  return screenPosition;
}
