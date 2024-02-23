import {
  ComponentUpdate,
  defineSystem,
  Entity,
  getComponentValue,
  Has,
  hasComponent,
  isComponentUpdate,
  Not,
} from "@latticexyz/recs";
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
      },
      headless: {
        components: { NextPosition },
      },
      local: {
        components: { AttackableEntities, LocalPosition },
      },
    },
    scenes: {
      Main: { objectPool },
    },
    api: { drawSpriteAtTile, drawTileHighlight },
  } = layer;

  function drawAttackSpritesOnTarget(attacker: Entity, target: Entity, showModifier = false) {
    const id = `${target}-attackable-highlight`;
    const outlineId = `${target}-attackable-outline`;

    const position = getComponentValue(LocalPosition, target);
    if (!position) return;

    let swordSprite = Sprites.Sword;
    if (showModifier) {
      const combatModifier = getArchetypeMatchupModifier(networkLayer, attacker, target);

      if (combatModifier > 0) {
        swordSprite = Sprites.SwordUp;
      } else if (combatModifier < 0) {
        swordSprite = Sprites.SwordDown;
      }
    }

    drawSpriteAtTile(id, swordSprite, position, RenderDepth.UI2, {
      yOffset: hasComponent(UnitType, target) ? -1 * UNIT_OFFSET : 0,
    });
    drawTileHighlight(outlineId, position, "red");
  }

  function drawAttackableEntities(update: ComponentUpdate) {
    const attacker = update.entity;

    objectPool.remove(`${attacker}-attackable-destination`);

    if (isComponentUpdate(update, AttackableEntities)) {
      const [, previousAttackableEntities] = update.value;

      if (previousAttackableEntities) {
        for (let i = 0; i < previousAttackableEntities.value.length; i++) {
          objectPool.remove(`${previousAttackableEntities.value[i] as Entity}-attackable-highlight`);
          objectPool.remove(`${previousAttackableEntities.value[i] as Entity}-attackable-outline`);
        }
      }
    }

    const attackableEntities = getComponentValue(AttackableEntities, attacker)?.value;
    if (!attackableEntities) return;

    const nextPosition = getComponentValue(NextPosition, attacker);

    if (nextPosition && nextPosition.userCommittedToPosition) {
      const destinationSpriteId = `${attacker}-attackable-destination`;
      drawSpriteAtTile(destinationSpriteId, Sprites.BootConfirm, nextPosition, RenderDepth.UI1);
    }

    if (nextPosition && nextPosition.intendedTarget) {
      attackableEntities.forEach((entity) => {
        if (entity !== nextPosition.intendedTarget) {
          objectPool.remove(`${entity}-attackable-highlight`);
        }
      });

      const target = nextPosition.intendedTarget;
      drawAttackSpritesOnTarget(attacker, target, true);
    } else {
      for (let i = 0; i < attackableEntities.length; i++) {
        const target = attackableEntities[i] as Entity;
        drawAttackSpritesOnTarget(attacker, target);
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
