import { tileCoordToPixelCoord } from "phaserx";
import { ComponentUpdate, defineSystem, Entity, getComponentValueStrict, Has, Not, UpdateType } from "@latticexyz/recs";
import { Animations } from "../../phaserConstants";
import { PhaserLayer, RenderDepth } from "../../types";

export function createSelectionSystem(layer: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: { input, maps, objectPool },
    },
    parentLayers: {
      local: {
        components: { LocalPosition, Path, Selected },
        api: { resetSelection },
      },
      headless: {
        components: { NextPosition },
      },
    },
  } = layer;

  // Reset selected area on ESC click
  input.onKeyPress(
    (keys) => keys.has("ESC"),
    () => {
      resetSelection();
    }
  );

  function drawSelection(
    update: ComponentUpdate & {
      type: UpdateType;
    }
  ) {
    const { entity, type } = update;
    const selectEntity = `${entity}-select` as Entity;

    if (type === UpdateType.Exit) {
      return objectPool.remove(selectEntity);
    }

    const obj = objectPool.get(selectEntity, "Sprite");
    obj.setComponent({
      id: "select",
      once: (box) => {
        box.play(Animations.TileHighlightYellow);

        const position = getComponentValueStrict(LocalPosition, entity);
        const pixelCoord = tileCoordToPixelCoord(position, maps.Main.tileWidth, maps.Main.tileHeight);

        box.setSize(maps.Main.tileWidth, maps.Main.tileHeight);
        box.setPosition(pixelCoord.x, pixelCoord.y);
        box.setDepth(RenderDepth.Background1);
        box.setOrigin(0);
      },
    });
  }

  defineSystem(world, [Has(Selected), Has(LocalPosition), Not(Path), Not(NextPosition)], (update) => {
    drawSelection(update);
  });

  defineSystem(world, [Has(Selected), Has(LocalPosition), Not(Path), Has(NextPosition)], (update) => {
    drawSelection(update);
  });
}
