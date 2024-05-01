import { tileCoordToPixelCoord } from "phaserx";
import { Has, getComponentValueStrict, defineSystem, UpdateType } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";

export function createDrawDevHighlightSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      local: {
        components: { LocalPosition },
      },
    },
    scenes: {
      Main: {
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    components: { DevHighlight },
    globalObjectPool,
  } = layer;

  defineSystem(world, [Has(DevHighlight), Has(LocalPosition)], ({ entity, type }) => {
    if (type === UpdateType.Exit) {
      return globalObjectPool.remove(`${entity}-dev-highlight`);
    }

    const devHighlight = getComponentValueStrict(DevHighlight, entity);
    const position = getComponentValueStrict(LocalPosition, entity);
    const sprite = globalObjectPool.get(`${entity}-dev-highlight`, "Rectangle");

    const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);

    sprite.setFillStyle(devHighlight.value ?? 0xf0e71d, 0.5);
    sprite.setSize(tileWidth, tileHeight);
    sprite.setPosition(pixelCoord.x, pixelCoord.y);
  });
}
