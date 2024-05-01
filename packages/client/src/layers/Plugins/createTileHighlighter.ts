import { WorldCoord } from "phaserx/src/types";
import { PhaserLayer } from "../Renderer/Phaser";
import { TILE_HEIGHT, TILE_WIDTH } from "../Renderer/Phaser/phaserConstants";
import { tileCoordToPixelCoord } from "phaserx";
import { RenderDepth } from "../Renderer/Phaser/types";

export function createTileHighlighter(phaserLayer: PhaserLayer, namespace: string) {
  const {
    api: { depthFromPosition },
    globalObjectPool,
  } = phaserLayer;

  const highlightedTiles: Set<string> = new Set();

  return {
    highlightTile: (coord: WorldCoord, color: number, alpha = 0.25) => {
      const highlightKey = `${coord.x},${coord.y}-highlight-${namespace}`;
      if (highlightedTiles.has(highlightKey)) return;

      highlightedTiles.add(highlightKey);

      const box = globalObjectPool.get(highlightKey, "Rectangle");
      const pixelCoord = tileCoordToPixelCoord(coord, TILE_WIDTH, TILE_HEIGHT);
      box.setOrigin(0, 0);
      box.setPosition(pixelCoord.x, pixelCoord.y);
      box.setSize(TILE_WIDTH, TILE_HEIGHT);
      box.setDepth(depthFromPosition(coord, RenderDepth.UI1));
      box.setFillStyle(color, alpha);
    },
    getAllHighlightedTiles: () => {
      return Object.keys(highlightedTiles).map((key) => {
        const [x, y] = key.split("-")[0].split(",");
        return { x: parseInt(x), y: parseInt(y) };
      });
    },
    clear: (coord: WorldCoord) => {
      const highlightKey = `${coord.x},${coord.y}-highlight-${namespace}`;
      globalObjectPool.remove(highlightKey);
      highlightedTiles.delete(highlightKey);
    },
    clearAll: () => {
      highlightedTiles.forEach((key) => {
        globalObjectPool.remove(key);
        highlightedTiles.delete(key);
      });
    },
  };
}
