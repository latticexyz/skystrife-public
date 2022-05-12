import { createPhaserEngine, tileCoordToPixelCoord } from "phaserx";
import { Entity, getComponentValue } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { LocalLayer } from "../../../Local";
import { Animations, Sprites, UnitTypeDeathAnimations } from "../phaserConstants";
import { PhaserLayer, RenderDepth } from "../types";

type Scenes = Awaited<ReturnType<typeof createPhaserEngine>>["scenes"];

function createTriggerBloodSplatter(
  scenes: Scenes,
  depthFromPosition: (position: { x: number; y: number }, depth: RenderDepth) => void
) {
  const {
    Main: {
      config,
      phaserScene,
      maps: {
        Main: { tileHeight, tileWidth },
      },
    },
  } = scenes;

  const bloodSplatterSprite = config.sprites[Sprites.Banner];
  const particleManager = phaserScene.add.particles(bloodSplatterSprite.assetKey, bloodSplatterSprite.frame);

  return (coord: Coord) => {
    const emitter = particleManager.createEmitter({
      scale: {
        start: 1.5,
        end: 0.3,
      },
      speed: {
        min: -200,
        max: 200,
      },
      gravityY: 400,
      lifespan: 200,
      blendMode: Phaser.BlendModes.SCREEN,
      deathCallback: () => particleManager.removeEmitter(emitter),
    });

    particleManager.setDepth(depthFromPosition(coord, RenderDepth.Foreground1));

    const pos = tileCoordToPixelCoord(coord, tileWidth, tileHeight);
    emitter.setBounds(pos.x - 6, pos.y, tileWidth + 12, tileHeight);
    emitter.explode(8, pos.x + tileWidth / 2, pos.y + tileHeight / 2);
  };
}

function createFlashRed(scenes: Scenes) {
  const {
    Main: { objectPool },
  } = scenes;

  return (entity: Entity) => {
    const embodiedObject = objectPool.get(entity, "Sprite");

    embodiedObject.setComponent({
      id: "flash-red",
      now: (sprite) => {
        const previousTint = sprite.tint;
        sprite.setTint(0xb00b1e);

        setTimeout(() => sprite.setTint(previousTint), 125);
      },
    });
  };
}

function createPlayDeathAnimation(
  playAnimationWithOwnerColor: (entity: Entity, animation: Animations) => void,
  scenes: Scenes,
  localLayer: LocalLayer
) {
  const { UnitType } = localLayer.parentLayers.network.components;

  return function (entity: Entity, onDeath: () => void) {
    const unitType = getComponentValue(UnitType, entity)?.value;
    if (!unitType) {
      onDeath();
      return;
    }

    const deathAnimation = UnitTypeDeathAnimations[unitType];

    const embodiedObject = scenes.Main.objectPool.get(entity, "Sprite");
    playAnimationWithOwnerColor(entity, deathAnimation);
    embodiedObject.setComponent({
      id: "death-animation",
      now: (sprite) => {
        sprite.on(`animationcomplete-${deathAnimation}`, () => {
          onDeath();
        });
      },
    });
  };
}

export function createAnimations(
  playAnimationWithOwnerColor: (entity: Entity, animation: Animations) => void,
  depthFromPosition: (position: { x: number; y: number }, depth: RenderDepth) => void,
  scenes: Scenes,
  localLayer: LocalLayer
) {
  return {
    flashRed: createFlashRed(scenes),
    playDeathAnimation: createPlayDeathAnimation(playAnimationWithOwnerColor, scenes, localLayer),
    triggerBloodSplatter: createTriggerBloodSplatter(scenes, depthFromPosition),
  };
}
