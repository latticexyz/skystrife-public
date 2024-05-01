import {
  Has,
  getComponentValue,
  defineSystem,
  UpdateType,
  isComponentUpdate,
  getComponentValueStrict,
  Not,
  defineExitSystem,
} from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "phaserx";
import { PhaserLayer } from "../../types";
import { FAST_MOVE_SPEED, UNIT_OFFSET } from "../../../../Local/constants";
import { Animations, WALK_ANIMATIONS } from "../../phaserConstants";
import { UnitTypes } from "../../../../Network";
import { WorldCoord } from "phaserx/src/types";
import { manhattan } from "../../../../../utils/distance";
import { skystrifeDebug } from "../../../../../debug";

const debug = skystrifeDebug.extend("local-position-system");

/**
 * The LocalPosition system handles moving phaser game objects to the WorldCoord specified in their LocalPosition component.
 */
export function createLocalPositionSystem(layer: PhaserLayer) {
  const {
    world,
    components: { Appearance },
    parentLayers: {
      network: {
        components: { UnitType, Movable },
      },
      local: {
        components: { LocalPosition },
      },
    },
    scenes: {
      Main: {
        phaserScene,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    globalObjectPool,
    api: { playAnimationWithOwnerColor },
  } = layer;

  // [up, down, left, right]
  function calculateDirectionIndex(oldPos: WorldCoord, newPos: WorldCoord) {
    if (newPos.y < oldPos.y) {
      return 0;
    } else if (newPos.y > oldPos.y) {
      return 1;
    } else if (newPos.x < oldPos.x) {
      return 2;
    } else {
      return 3;
    }
  }

  defineSystem(world, [Has(LocalPosition), Has(Appearance), Not(UnitType)], ({ entity, type }) => {
    if (type === UpdateType.Enter) {
      const sprite = globalObjectPool.get(entity, "Sprite");
      const position = getComponentValue(LocalPosition, entity);
      if (!position) return;

      const pixel = tileCoordToPixelCoord(position, tileWidth, tileHeight);
      sprite.setPosition(pixel.x, pixel.y);
    }
  });

  defineSystem(world, [Has(LocalPosition), Has(Appearance), Has(UnitType)], ({ entity, type }) => {
    if (type === UpdateType.Enter) {
      const sprite = globalObjectPool.get(entity, "Sprite");
      const position = getComponentValue(LocalPosition, entity);
      if (!position) return;

      const pixel = tileCoordToPixelCoord(position, tileWidth, tileHeight);
      sprite.setPosition(pixel.x, pixel.y - UNIT_OFFSET);
    }
  });

  defineSystem(world, [Has(LocalPosition), Has(Appearance), Not(Movable)], (update) => {
    if (!isComponentUpdate(update, LocalPosition)) return;
    const [newPosition] = update.value;
    if (!newPosition) return;

    const pixelCoord = tileCoordToPixelCoord(newPosition, tileWidth, tileHeight);
    const sprite = globalObjectPool.get(update.entity, "Sprite");
    sprite.setPosition(pixelCoord.x, pixelCoord.y);
  });

  defineExitSystem(world, [Has(LocalPosition), Has(Appearance)], ({ entity }) => {
    globalObjectPool.remove(entity);
  });

  defineSystem(world, [Has(LocalPosition), Has(UnitType), Has(Appearance)], (update) => {
    if (update.type === UpdateType.Exit) {
      return globalObjectPool.remove(update.entity);
    }

    if (!isComponentUpdate(update, LocalPosition)) return;
    const [newPosition, oldPosition] = update.value;

    if (!newPosition || !oldPosition) return;

    const sprite = globalObjectPool.get(update.entity, "Sprite");

    if (update.type === UpdateType.Update && update.component.id === LocalPosition.id) {
      const [newPosition, oldPosition] = update.value;
      if (!newPosition || !oldPosition) return;

      const unitType = getComponentValueStrict(UnitType, update.entity).value;
      const isAdjacentMove = manhattan(newPosition, oldPosition) === 1;
      const walkAnimations = WALK_ANIMATIONS[unitType as UnitTypes];

      const pixelPosition = tileCoordToPixelCoord(newPosition, tileWidth, tileHeight);

      if (isAdjacentMove && walkAnimations) {
        const directionIndex = calculateDirectionIndex(oldPosition, newPosition);
        const anim = walkAnimations[directionIndex];
        const currentAnim = sprite.anims.currentAnim;

        if (anim !== currentAnim?.key) {
          playAnimationWithOwnerColor(update.entity, anim as Animations);
        }
      }

      const moveSpeed = FAST_MOVE_SPEED;
      phaserScene.add.tween({
        targets: sprite,
        duration: moveSpeed,
        x: pixelPosition.x,
        y: pixelPosition.y - UNIT_OFFSET,
        ease: Phaser.Math.Easing.Linear,
      });
    }
  });
}
