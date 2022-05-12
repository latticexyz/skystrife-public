import {
  ComponentUpdate,
  defineSystem,
  Entity,
  getComponentValue,
  Has,
  isComponentUpdate,
  Not,
} from "@latticexyz/recs";
import { Sprites } from "../../phaserConstants";
import { PhaserLayer, RenderDepth } from "../../types";

export function createDrawAttackableEntitiesSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      local: {
        components: { AttackableEntities, LocalPosition },
      },
      headless: {
        components: { NextPosition },
      },
      network: {
        utils: { isOwnedByCurrentPlayer },
      },
    },
    scenes: {
      Main: { objectPool },
    },
    api: { drawSpriteAtTile, drawTileHighlight },
  } = layer;

  function drawAttackableEntities(update: ComponentUpdate) {
    if (isComponentUpdate(update, AttackableEntities)) {
      const [, previousAttackableEntities] = update.value;

      if (previousAttackableEntities) {
        for (let i = 0; i < previousAttackableEntities.value.length; i++) {
          objectPool.remove(`${previousAttackableEntities.value[i] as Entity}-attackable-highlight`);
          objectPool.remove(`${previousAttackableEntities.value[i] as Entity}-attackable-outline`);
          objectPool.remove(`${previousAttackableEntities.value[i] as Entity}-attackable-destination`);
          objectPool.remove(`${previousAttackableEntities.value[i] as Entity}-attackable-destination-outline`);
        }
      }
    }

    const attackableEntities = getComponentValue(AttackableEntities, update.entity);
    if (attackableEntities) {
      const nextPosition = getComponentValue(NextPosition, update.entity);

      // User is now confirming whether they want to move or attack one of the attackable targets
      if (nextPosition && nextPosition.userCommittedToPosition) {
        for (let i = 0; i < attackableEntities.value.length; i++) {
          const id = `${attackableEntities.value[i]}-attackable-highlight`;
          const outlineId = `${attackableEntities.value[i]}-attackable-outline`;

          const destinationSpriteId = `${attackableEntities.value[i]}-attackable-destination`;
          const destinationOutlineId = `${attackableEntities.value[i]}-attackable-destination-outline`;

          const position = getComponentValue(LocalPosition, attackableEntities.value[i] as Entity);
          if (!position) continue;

          drawSpriteAtTile(id, Sprites.SwordConfirm, position, RenderDepth.UI2);

          drawTileHighlight(outlineId, position, "red");

          drawSpriteAtTile(destinationSpriteId, Sprites.BootConfirm, nextPosition, RenderDepth.UI1);

          drawTileHighlight(destinationOutlineId, nextPosition, "yellow");
        }
      } else {
        for (let i = 0; i < attackableEntities.value.length; i++) {
          const id = `${attackableEntities.value[i]}-attackable-highlight`;
          const outlineId = `${attackableEntities.value[i]}-attackable-outline`;

          const position = getComponentValue(LocalPosition, attackableEntities.value[i] as Entity);
          if (!position) continue;

          if (isOwnedByCurrentPlayer(update.entity))
            drawSpriteAtTile(id, Sprites.SwordConfirm, position, RenderDepth.UI2);
          drawTileHighlight(outlineId, position, "red");
        }
      }
    }
  }

  defineSystem(world, [Has(AttackableEntities), Has(NextPosition)], (update) => {
    drawAttackableEntities(update);
  });

  defineSystem(world, [Has(AttackableEntities), Not(NextPosition)], (update) => {
    drawAttackableEntities(update);
  });
}
