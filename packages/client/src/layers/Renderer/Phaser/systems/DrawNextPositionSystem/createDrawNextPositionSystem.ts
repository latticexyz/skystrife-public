import { tileCoordToPixelCoord } from "phaserx";
import {
  ComponentUpdate,
  defineExitSystem,
  defineSystem,
  Entity,
  getComponentValue,
  getComponentValueStrict,
  Has,
  Not,
  removeComponent,
  UpdateType,
} from "@latticexyz/recs";

import { PhaserLayer, RenderDepth } from "../../types";
import { UNIT_OFFSET } from "../../../../Local/constants";
import { Animations, Sprites } from "../../phaserConstants";
import { aStar } from "../../../../../utils/pathfinding";
import { worldCoordEq } from "../../../../../utils/coords";

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
        components: { Transaction },
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
      drawTileHighlight,
      depthFromPosition,
    },
  } = layer;

  const attackArrowsByEntity = new Map<Entity, Phaser.GameObjects.Group>();
  const tweens = {} as Record<Entity, Phaser.Tweens.Tween>;

  function drawNextPositionGhost(update: ComponentUpdate & { type: UpdateType }) {
    const { entity, type } = update;

    const lastAttackArrowGroup = attackArrowsByEntity.get(entity);
    lastAttackArrowGroup?.destroy(true);

    const spriteId = `${entity}-nextPosition` as Entity;
    const attackSpriteId = `${entity}-attack` as Entity;
    const attackOutlineId = `${entity}-attack-outline` as Entity;

    if (type === UpdateType.Exit) {
      objectPool.remove(spriteId);
      objectPool.remove(attackSpriteId);
      objectPool.remove(attackOutlineId);
      return;
    }

    const nextPosition = getComponentValueStrict(NextPosition, entity);

    const animation = getComponentValue(SpriteAnimation, entity);
    if (!animation) return;

    const position = getComponentValue(LocalPosition, entity);
    if (!position || !worldCoordEq(position, nextPosition)) {
      const color = getOwnerColor(entity);
      playTintedAnimation(spriteId, animation.value as Animations, color.name, (attackSprite) => {
        const pixelCoord = tileCoordToPixelCoord(nextPosition, tileWidth, tileHeight);
        attackSprite.setPosition(pixelCoord.x, pixelCoord.y - UNIT_OFFSET);
        attackSprite.setDepth(depthFromPosition({ x: nextPosition.x, y: nextPosition.y }, RenderDepth.Foreground3));
        attackSprite.setAlpha(0.65);
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
        (coord) => 0,
        () => false
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

      // draw attack icon on target
      drawSpriteAtTile(attackSpriteId, Sprites.SwordConfirm, intendedTargetPosition, RenderDepth.UI2);
      drawTileHighlight(attackOutlineId, intendedTargetPosition, "red");
    }
  }

  defineSystem(world, [Has(NextPosition)], (update) => {
    drawNextPositionGhost(update);
  });

  Transaction.update$.subscribe((update) => {
    const [currentValue] = update.value;
    if (!currentValue) return;

    const { entity } = currentValue;
    if (!entity) return;

    if (["submitted", "pending"].includes(currentValue.status)) {
      const nextPosition = getComponentValue(NextPosition, entity);
      if (nextPosition && nextPosition.intendedTarget) {
        const intendedTargetPosition = getComponentValue(LocalPosition, nextPosition.intendedTarget);
        if (intendedTargetPosition) {
          const attackSpriteId = `${entity}-attack` as Entity;
          drawSpriteAtTile(attackSpriteId, Sprites.Sword, intendedTargetPosition, RenderDepth.UI2);
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

    if (["reverted", "completed"].includes(currentValue.status)) {
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
