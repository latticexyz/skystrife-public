import { Entity, Has, Not, NotValue, getComponentValue } from "@latticexyz/recs";
import { PhaserLayer } from "../..";
import { tileCoordToPixelCoord } from "phaserx";
import { Sprites, TILE_HEIGHT, TILE_WIDTH } from "../../phaserConstants";
import { RenderDepth } from "../../types";
import { EmbodiedEntity, WorldCoord } from "phaserx/src/types";

export function createShieldSystem(layer: PhaserLayer) {
  const {
    parentLayers: {
      local: {
        components: { LocalPosition },
      },
      headless: {
        components: { NextPosition },
      },
    },
    components: { WillBeDestroyed, TerrainArmorBonus },
    defineGameObjectSystem,
    api: { depthFromPosition },
    scenes: {
      Main: {
        config: { sprites },
      },
    },
  } = layer;

  function drawShields(entity: Entity, gameObjects: Phaser.GameObjects.Sprite[], position: WorldCoord) {
    const spriteConfig = sprites[Sprites.Armor];

    gameObjects.forEach((sprite) => {
      sprite.setTexture(spriteConfig.assetKey, spriteConfig.frame);
      sprite.setVisible(false);
    });

    const terrainArmorBonus = getComponentValue(TerrainArmorBonus, entity)?.value;
    if (!terrainArmorBonus) return;

    const pixelCoord = tileCoordToPixelCoord(position, TILE_WIDTH, TILE_HEIGHT);

    let numShields = 0;
    if (terrainArmorBonus <= -30) numShields = 2;
    else if (terrainArmorBonus <= -15) numShields = 1;

    if (numShields === 0) return;

    for (let i = 0; i < numShields; i++) {
      const shield = gameObjects[i];
      let x = pixelCoord.x + TILE_WIDTH / 2;
      if (numShields === 2) {
        x += i === 0 ? -TILE_WIDTH / 6 : TILE_WIDTH / 6;
      }

      shield.setScale(0.5);
      shield.setPosition(x, pixelCoord.y - 22);
      shield.setDepth(depthFromPosition(position, RenderDepth.UI1));
      shield.setOrigin(0.5, 0);
      shield.setVisible(true);
    }
  }

  defineGameObjectSystem(
    2,
    "Sprite",
    [Has(LocalPosition), Not(NextPosition), NotValue(WillBeDestroyed, { value: true }), Has(TerrainArmorBonus)],
    (update, gameObjects) => {
      const position = getComponentValue(LocalPosition, update.entity);
      if (!position) return;

      drawShields(update.entity, gameObjects, position);
    },
  );

  defineGameObjectSystem(
    2,
    "Sprite",
    [Has(LocalPosition), Has(NextPosition), NotValue(WillBeDestroyed, { value: true }), Has(TerrainArmorBonus)],
    (update, gameObjects) => {
      const position = getComponentValue(NextPosition, update.entity);
      if (!position) return;

      drawShields(update.entity, gameObjects, position);
    },
  );
}
