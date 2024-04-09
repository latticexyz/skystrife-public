import { tileCoordToPixelCoord } from "phaserx";
import {
  ComponentUpdate,
  defineExitSystem,
  defineSystem,
  Entity,
  getComponentValue,
  getComponentValueStrict,
  Has,
  removeComponent,
  UpdateType,
} from "@latticexyz/recs";

import { PhaserLayer, RenderDepth } from "../../types";
import { UNIT_OFFSET } from "../../../../Local/constants";
import { Animations, Sprites } from "../../phaserConstants";
import { aStar } from "../../../../../utils/pathfinding";
import { worldCoordEq } from "../../../../../utils/coords";
import { UnitTypes } from "../../../../Network";

export function createDrawNextPositionSystem(layer: PhaserLayer) {
  const {
    world,
    components: { SpriteAnimation },
    parentLayers: {
      headless: {
        components: { NextPosition },
      },
      local: {
        api: {
          getOwnerColor,
          systemDecoders: { onCombat },
        },
        components: { LocalPosition, Path },
      },
      network: {
        components: { Action, UnitType },
        network: { matchEntity },
      },
    },
    scenes: {
      Main: {
        objectPool,
        phaserScene,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    api: {
      playTintedAnimation,
      arrowPainter: { paintArrowAlongPath },
      drawSpriteAtTile,
      depthFromPosition,
      clearIncomingDamage,
    },
  } = layer;

  const attackArrowsByEntity = new Map<Entity, Phaser.GameObjects.Group>();
  const tweens = {} as Record<Entity, Phaser.Tweens.Tween>;

  function drawNextPositionGhost(update: ComponentUpdate & { type: UpdateType }) {
    const { entity, type } = update;

    const lastAttackArrowGroup = attackArrowsByEntity.get(entity);
    attackArrowsByEntity.delete(entity);
    lastAttackArrowGroup?.destroy(true);

    const spriteId = `${entity}-nextPosition` as Entity;
    const attackSpriteId = `${entity}-attack` as Entity;

    objectPool.remove(spriteId);
    objectPool.remove(attackSpriteId);

    if (type === UpdateType.Exit) {
      return;
    }

    const nextPosition = getComponentValueStrict(NextPosition, entity);

    const animation = getComponentValue(SpriteAnimation, entity);
    if (!animation) return;

    const position = getComponentValue(LocalPosition, entity);
    if (!position || !worldCoordEq(position, nextPosition)) {
      const color = getOwnerColor(entity, matchEntity);
      playTintedAnimation(spriteId, animation.value as Animations, color.name, (attackSprite) => {
        const pixelCoord = tileCoordToPixelCoord(nextPosition, tileWidth, tileHeight);
        attackSprite.setPosition(pixelCoord.x, pixelCoord.y - UNIT_OFFSET);
        attackSprite.setDepth(depthFromPosition({ x: nextPosition.x, y: nextPosition.y }, RenderDepth.Foreground3));
        attackSprite.setAlpha(0.65);

        const unitType = getComponentValue(UnitType, entity)?.value;
        if (unitType === UnitTypes.Brute) {
          attackSprite.setOrigin(0.18, 0.18);
        }
      });
    }

    // paint an attack arrow from the NextPosition -> the intended target
    if (nextPosition.intendedTarget) {
      const intendedTargetPosition = getComponentValue(LocalPosition, nextPosition.intendedTarget);
      if (!intendedTargetPosition) return;

      // this is not a real path, just using aStar to coordinates the
      // arrow painter expects
      const path = aStar(
        nextPosition,
        intendedTargetPosition,
        100_000,
        (_coord) => 0,
        () => false,
      );

      path.unshift(nextPosition);

      const arrowGroup = paintArrowAlongPath("Attack", path);

      if (arrowGroup) {
        attackArrowsByEntity.set(entity, arrowGroup);

        // if arrow is already animated recreate it here
        if (tweens[entity]) {
          tweens[entity].destroy();
          tweens[entity] = phaserScene.add.tween({
            targets: arrowGroup.getChildren(),
            ease: "Linear",
            duration: 250,
            repeat: -1,
            alpha: 0,
            yoyo: true,
          });
        }
      }
    }
  }

  defineSystem(world, [Has(NextPosition)], (update) => {
    drawNextPositionGhost(update);
  });

  Action.update$.subscribe((update) => {
    const [currentValue] = update.value;
    if (!currentValue) return;

    const { entity } = currentValue;
    if (!entity) return;

    if (["pending"].includes(currentValue.status)) {
      const nextPosition = getComponentValue(NextPosition, entity);
      if (nextPosition && nextPosition.intendedTarget) {
        const intendedTargetPosition = getComponentValue(LocalPosition, nextPosition.intendedTarget);
        if (intendedTargetPosition) {
          const attackSpriteId = `${entity}-attack` as Entity;
          const sprite = drawSpriteAtTile(attackSpriteId, Sprites.Sword, intendedTargetPosition, RenderDepth.UI2, {
            yOffset: -1 * UNIT_OFFSET,
          });
          phaserScene.add.tween({
            targets: sprite,
            ease: "Linear",
            duration: 250,
            repeat: -1,
            alpha: 0,
            yoyo: true,
          });
        }
      }

      const attackArrow = attackArrowsByEntity.get(entity);
      if (attackArrow && !tweens[entity]) {
        const tween = phaserScene.add.tween({
          targets: attackArrow.getChildren(),
          ease: "Linear",
          duration: 250,
          repeat: -1,
          alpha: 0,
          yoyo: true,
        });
        tweens[entity] = tween;
      }
    }

    if (currentValue.status === "failed") {
      const nextPosition = getComponentValue(NextPosition, entity);
      if (nextPosition) {
        if (nextPosition.intendedTarget) {
          clearIncomingDamage(entity, nextPosition.intendedTarget);
          clearIncomingDamage(nextPosition.intendedTarget, entity);
        }

        removeComponent(NextPosition, entity);
      }
    }

    if (["failed", "completed"].includes(currentValue.status)) {
      if (tweens[entity]) {
        tweens[entity].destroy();
        delete tweens[entity];

        const attackArrow = attackArrowsByEntity.get(entity);
        if (attackArrow) {
          for (const sprite of attackArrow.getChildren()) {
            (sprite as Phaser.GameObjects.Sprite).setAlpha(1);
          }
        }
      }
    }
  });

  // when they stop moving
  defineExitSystem(world, [Has(Path)], ({ entity }) => {
    removeComponent(NextPosition, entity);
  });

  onCombat((combat) => {
    removeComponent(NextPosition, combat.attacker);
  });
}
