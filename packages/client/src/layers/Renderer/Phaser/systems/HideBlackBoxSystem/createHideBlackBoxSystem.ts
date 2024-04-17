import { Entity, getComponentValue, getEntityComponents } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";

export function createHideBlackBoxSystem(layer: PhaserLayer) {
  const {
    scenes: {
      Main: { phaserScene, objectPool },
    },
  } = layer;

  setInterval(() => {
    let numRemoved = 0;

    phaserScene.children.getAll().forEach((gameObject) => {
      if (gameObject instanceof Phaser.GameObjects.Sprite) {
        if (gameObject.texture.key === "MainAtlas" && gameObject.frame.name === "sprites/blank.png") {
          const id = gameObject.getData("objectPoolId");

          if (id) {
            objectPool.remove(id);
            numRemoved++;
          }
        }
      }
    });

    if (numRemoved > 0) {
      console.warn(`Removed ${numRemoved} orphaned game objects.`);
    }
  }, 10_000);
}
