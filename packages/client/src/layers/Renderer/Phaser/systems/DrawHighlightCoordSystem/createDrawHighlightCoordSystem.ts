import { tileCoordToPixelCoord } from "phaserx";
import { Has, getComponentValueStrict, UpdateType, defineSystem, Entity } from "@latticexyz/recs";
import { Animations } from "../../phaserConstants";
import { PhaserLayer, RenderDepth } from "../../types";
import { singletonEntity } from "@latticexyz/store-sync/recs";

export function createDrawHighlightCoordSystem(layer: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: {
        objectPool,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    components: { HoverHighlight },
    api: { playTintedAnimation },
  } = layer;

  defineSystem(world, [Has(HoverHighlight)], ({ entity, type }) => {
    const highlightEntity = `${entity}-hover-highlight` as Entity;

    if (type === UpdateType.Exit) {
      objectPool.remove(highlightEntity);
      return;
    }

    const hoverHighlght = getComponentValueStrict(HoverHighlight, singletonEntity);
    const highlight = objectPool.get(highlightEntity, "Sprite");
    const position = { x: hoverHighlght.x, y: hoverHighlght.y };

    playTintedAnimation(highlightEntity, Animations.TileSelect, "white");

    highlight.setComponent({
      id: `highlight`,
      once: (box) => {
        const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);
        box.setPosition(pixelCoord.x, pixelCoord.y);
        box.setDepth(RenderDepth.Background2);
      },
    });
  });
}
