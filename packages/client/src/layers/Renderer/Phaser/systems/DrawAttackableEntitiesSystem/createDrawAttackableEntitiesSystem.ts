import { ComponentUpdate, defineSystem, Entity, getComponentValue, Has, hasComponent, Not } from "@latticexyz/recs";
import { Sprites } from "../../phaserConstants";
import { PhaserLayer, RenderDepth } from "../../types";
import { getArchetypeMatchupModifier } from "../../../../Headless/utils";
import { UNIT_OFFSET } from "../../../../Local/constants";

export function createDrawAttackableEntitiesSystem(layer: PhaserLayer) {
  const {
    parentLayers: {
      network: networkLayer,
      network: {
        world,
        components: { UnitType },
        utils: { hasPendingAction },
      },
      headless: {
        components: { NextPosition },
      },
      local: {
        components: { AttackableEntities, LocalPosition },
      },
    },
    globalObjectPool,
    api: { drawSpriteAtTile, drawTileHighlight },
  } = layer;

  function drawAttackSpritesOnTarget(attacker: Entity, target: Entity, index: number) {
    const id = `${index}-attackable-highlight`;
    const outlineId = `${index}-attackable-outline`;

    const position = getComponentValue(LocalPosition, target);
    if (!position) return;

    let swordSprite = Sprites.Sword;
    const combatModifier = getArchetypeMatchupModifier(networkLayer, attacker, target);

    if (combatModifier > 0) {
      swordSprite = Sprites.SwordUp;
    } else if (combatModifier < 0) {
      swordSprite = Sprites.SwordDown;
    }

    drawSpriteAtTile(id, swordSprite, position, RenderDepth.UI2, {
      yOffset: hasComponent(UnitType, target) ? -1 * UNIT_OFFSET : 0,
    });
    drawTileHighlight(outlineId, position, "red");
  }

  function drawAttackableEntities(update: ComponentUpdate) {
    const attacker = update.entity;

    globalObjectPool.remove(`${attacker}-attackable-destination`);
    for (let i = 0; i < 30; i++) {
      globalObjectPool.remove(`${i}-attackable-highlight`);
      globalObjectPool.remove(`${i}-attackable-outline`);
    }

    if (hasPendingAction(update.entity)) return;

    const attackableEntities = getComponentValue(AttackableEntities, attacker)?.value;
    if (!attackableEntities) return;

    const nextPosition = getComponentValue(NextPosition, attacker);

    if (nextPosition && nextPosition.userCommittedToPosition) {
      const destinationSpriteId = `${attacker}-attackable-destination`;
      drawSpriteAtTile(destinationSpriteId, Sprites.BootConfirm, nextPosition, RenderDepth.UI1);
    }

    if (nextPosition && nextPosition.intendedTarget) {
      attackableEntities.forEach((entity, i) => {
        if (entity !== nextPosition.intendedTarget) {
          globalObjectPool.remove(`${i}-attackable-highlight`);
        }
      });

      const target = nextPosition.intendedTarget;
      drawAttackSpritesOnTarget(attacker, target, 0);
    } else {
      for (let i = 0; i < attackableEntities.length; i++) {
        const target = attackableEntities[i] as Entity;
        drawAttackSpritesOnTarget(attacker, target, i);
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
