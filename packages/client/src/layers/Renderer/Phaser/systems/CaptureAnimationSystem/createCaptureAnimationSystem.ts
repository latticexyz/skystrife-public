import { defineSystem, Has } from "@latticexyz/recs";
import { Animations, TILE_HEIGHT, TILE_WIDTH } from "../../phaserConstants";
import { PhaserLayer, RenderDepth } from "../../types";
import { pixelCoordToTileCoord } from "phaserx";

export function createCaptureAnimationSystem(layer: PhaserLayer) {
  const {
    parentLayers: {
      local: {
        components: { Capturer },
        api: { getOwnerColor },
      },
      network: {
        network: { world, matchEntity },
      },
    },
    api: { getEntityPixelCoord, setOriginCenter, depthFromPosition },
    scenes: {
      Main: { phaserScene },
    },
  } = layer;

  defineSystem(world, [Has(Capturer)], ({ entity }) => {
    const { x, y } = getEntityPixelCoord(entity);
    const gameObject = phaserScene.add.sprite(x, y, "");
    const ownerColorName = getOwnerColor(entity, matchEntity).name;

    const tileCoord = pixelCoordToTileCoord({ x, y }, TILE_WIDTH, TILE_HEIGHT);

    gameObject.setPosition(x, y - 20);
    gameObject.play(`${Animations.Capture}-${ownerColorName}`);
    gameObject.setDepth(depthFromPosition(tileCoord, RenderDepth.UI1));
    setOriginCenter(gameObject);

    gameObject.once("animationcomplete", () => {
      gameObject.destroy();
    });
  });
}
