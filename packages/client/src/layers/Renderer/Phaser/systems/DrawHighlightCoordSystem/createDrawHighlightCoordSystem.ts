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
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    components: { HoverHighlight },
    api: { playTintedAnimation },
    globalObjectPool,
  } = layer;

  defineSystem(world, [Has(HoverHighlight)], ({ entity, type }) => {
    const highlightEntity = `${entity}-hover-highlight` as Entity;

    if (type === UpdateType.Exit) {
      globalObjectPool.remove(highlightEntity);
      return;
    }

    const hoverHighlght = getComponentValueStrict(HoverHighlight, singletonEntity);
    const sprite = globalObjectPool.get(highlightEntity, "Sprite");
    const position = { x: hoverHighlght.x, y: hoverHighlght.y };

    playTintedAnimation(highlightEntity, Animations.TileSelect, "white");

    const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);
    sprite.setPosition(pixelCoord.x, pixelCoord.y);
    sprite.setDepth(RenderDepth.Background2);
  });
}
