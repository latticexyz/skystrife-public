import { tileCoordToPixelCoord } from "phaserx";
import { ComponentUpdate, defineSystem, Entity, getComponentValueStrict, Has, Not, UpdateType } from "@latticexyz/recs";
import { Animations } from "../../phaserConstants";
import { PhaserLayer, RenderDepth } from "../../types";

export function createSelectionSystem(layer: PhaserLayer) {
  const {
    globalObjectPool,
    world,
    scenes: {
      Main: { input, maps },
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
    },
  );

  function drawSelection(
    update: ComponentUpdate & {
      type: UpdateType;
    },
  ) {
    const { entity, type } = update;
    const selectEntity = `${entity}-select` as Entity;

    if (type === UpdateType.Exit) {
      return globalObjectPool.remove(selectEntity);
    }

    const sprite = globalObjectPool.get(selectEntity, "Sprite");
    sprite.play(Animations.TileHighlightYellow);

    const position = getComponentValueStrict(LocalPosition, entity);
    const pixelCoord = tileCoordToPixelCoord(position, maps.Main.tileWidth, maps.Main.tileHeight);

    sprite.setSize(maps.Main.tileWidth, maps.Main.tileHeight);
    sprite.setPosition(pixelCoord.x, pixelCoord.y);
    sprite.setDepth(RenderDepth.Background1);
    sprite.setOrigin(0);
  }

  defineSystem(world, [Has(Selected), Has(LocalPosition), Not(Path), Not(NextPosition)], (update) => {
    drawSelection(update);
  });

  defineSystem(world, [Has(Selected), Has(LocalPosition), Not(Path), Has(NextPosition)], (update) => {
    drawSelection(update);
  });
}
