import { Entity, getComponentValue, getEntityComponents } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";

export function createHideBlackBoxSystem(layer: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: { phaserScene, objectPool },
    },
  } = layer;

  setInterval(() => {
    phaserScene.children.getAll().forEach((gameObject) => {
      if (gameObject instanceof Phaser.GameObjects.Sprite) {
        if (gameObject.texture.key === "__MISSING") {
          const id = gameObject.getData("objectPoolId");

          console.warn(`[HideBlackBoxSystem] despawn object ${id} because of missing texture`);
          console.warn(`[HideBlackBoxSystem] components:`);
          const components = getEntityComponents(world, id as Entity).reduce((acc, component) => {
            acc[component.id] = getComponentValue(component, id as Entity);
            return acc;
          }, {} as Record<string, unknown>);
          console.table(components);
          objectPool.remove(id);
        }
      }
    });
  }, 1000);
}
