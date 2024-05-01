import { defineSystem, getComponentValueStrict, Has, UpdateType } from "@latticexyz/recs";
import { Animations } from "../../phaserConstants";
import { PhaserLayer } from "../../types";
import { skystrifeDebug } from "../../../../../debug";

const debug = skystrifeDebug.extend("sprite-animation-system");

/**
 * The Appearance system handles setting textures of phaser game objects based on their Appearance component
 */
export function createSpriteAnimationSystem(layer: PhaserLayer) {
  const {
    world,
    components: { SpriteAnimation, HueTint },
    api: { playTintedAnimation },
    globalObjectPool,
    scenes: {
      Main: {
        maps: {
          Main: { tileWidth },
        },
      },
    },
    parentLayers: {
      local: {
        components: { LocalPosition },
      },
    },
  } = layer;

  defineSystem(world, [Has(SpriteAnimation), Has(HueTint), Has(LocalPosition)], ({ entity, type, component }) => {
    if (![UpdateType.Enter, UpdateType.Update].includes(type)) return;
    if (type === UpdateType.Update && component.id === LocalPosition.id) return;

    const sprite = globalObjectPool.get(entity, "Sprite");

    const animation = getComponentValueStrict(SpriteAnimation, entity).value;
    const hueTint = getComponentValueStrict(HueTint, entity).value;
    playTintedAnimation(entity, animation as Animations, hueTint);
    const animationSize = sprite.width * sprite.scaleX;
    const newOrigin = (animationSize - tileWidth) / (2 * animationSize);
    sprite.setOrigin(newOrigin);
  });
}
