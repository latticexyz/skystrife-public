import { Entity, Has, HasValue, Not, getComponentValue } from "@latticexyz/recs";
import { PhaserLayer } from "../..";
import { tileCoordToPixelCoord } from "phaserx";
import { Sprites, TILE_HEIGHT, TILE_WIDTH } from "../../phaserConstants";
import { RenderDepth } from "../../types";
import { EmbodiedEntity, WorldCoord } from "phaserx/src/types";
import { createLocalPositionSystem } from "../LocalPositionSystem";

export function createSkullSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { Combat },
      },
      headless: {
        components: { NextPosition },
      },
      local: {
        components: { LocalPosition },
      },
    },
    components: { WillBeDestroyed },
    defineGameObjectSystem,
    api: { depthFromPosition },
    scenes: {
      Main: {
        config: { sprites },
        phaserScene,
      },
    },
  } = layer;

  function drawSkull(skullSprite: Phaser.GameObjects.Sprite, position: WorldCoord) {
    const pixelCoord = tileCoordToPixelCoord(position, TILE_WIDTH, TILE_HEIGHT);
    const spriteConfig = sprites[Sprites.Skull];

    skullSprite.setPosition(pixelCoord.x + TILE_WIDTH / 2, pixelCoord.y - 28);
    skullSprite.setDepth(depthFromPosition(position, RenderDepth.UI1));
    skullSprite.setOrigin(0.5, 0);
    skullSprite.setTexture(spriteConfig.assetKey, spriteConfig.frame);
    skullSprite.setAlpha(0.25);

    phaserScene.add.tween({
      targets: skullSprite,
      duration: 500,
      repeat: -1,
      yoyo: true,
      ease: "Sine.easeInOut",
      alpha: 1,
      scale: 1.1,
      y: "-=2",
    });
  }

  defineGameObjectSystem(
    1,
    "Sprite",
    [Has(LocalPosition), Has(NextPosition), HasValue(WillBeDestroyed, { value: true })],
    (update, gameObjects) => {
      const nextPosition = getComponentValue(NextPosition, update.entity);
      if (!nextPosition) return;

      drawSkull(gameObjects[0], nextPosition);
    },
  );

  defineGameObjectSystem(
    1,
    "Sprite",
    [Has(LocalPosition), Not(NextPosition), HasValue(WillBeDestroyed, { value: true })],
    (update, gameObjects) => {
      const position = getComponentValue(LocalPosition, update.entity);
      if (!position) return;

      drawSkull(gameObjects[0], position);
    },
  );
}
