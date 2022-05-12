import { tileCoordToPixelCoord } from "phaserx";
import { getComponentValue, Has, Not } from "@latticexyz/recs";
import { PhaserLayer } from "../..";
import { Sprites } from "../../phaserConstants";
import { RenderDepth } from "../../types";
import { UNIT_OFFSET } from "../../../../Local/constants";

export const createDrawShadowSystem = (layer: PhaserLayer) => {
  const {
    defineGameObjectSystem,
    scenes: {
      Main: {
        config,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    api: { depthFromPosition },
    parentLayers: {
      network: {
        components: { UnitType },
      },
      local: {
        components: { LocalPosition, Path },
      },
    },
  } = layer;

  defineGameObjectSystem(1, "Sprite", [Has(UnitType), Has(LocalPosition), Not(Path)], ({ entity }, [imageObj]) => {
    const position = getComponentValue(LocalPosition, entity);
    if (!position) return;

    const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);
    const spriteAsset = config.sprites[Sprites.Shadow];

    imageObj.setComponent({
      id: "Shadow",
      once: (shadow) => {
        shadow.setTexture(spriteAsset.assetKey, spriteAsset.frame);
        shadow.setPosition(pixelCoord.x, pixelCoord.y + tileHeight / 2 - UNIT_OFFSET + 4);
        shadow.setDepth(depthFromPosition(position, RenderDepth.Foreground5));
        shadow.setOrigin(0, 0.5);
      },
    });
  });
};
