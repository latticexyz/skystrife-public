import { tileCoordToPixelCoord } from "phaserx";
import {
  ComponentUpdate,
  Entity,
  getComponentValueStrict,
  hasComponent,
  isComponentUpdate,
  UpdateType,
} from "@latticexyz/recs";
import { Animations, Sprites } from "../../phaserConstants";
import { PhaserLayer, RenderDepth } from "../../types";

export function drawPlayerColorBanner(layer: PhaserLayer, entity: Entity, type: UpdateType, yOffset: number) {
  const {
    parentLayers: {
      network: {
        network: { matchEntity },
      },
      local: {
        components: { LocalPosition },
        api: { getOwnerColor },
      },
    },
    api: { playTintedAnimation, depthFromPosition },
    scenes: {
      Main: {
        objectPool,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = layer;

  const bannerId = `${entity}-player-color-banner`;

  if (type === UpdateType.Exit) {
    objectPool.remove(bannerId);
    return;
  }

  const color = getOwnerColor(entity, matchEntity);
  const position = getComponentValueStrict(LocalPosition, entity);

  playTintedAnimation(bannerId as Entity, Animations.Banner, color.name);

  const bannerObj = objectPool.get(bannerId, "Sprite");
  bannerObj.setComponent({
    id: "player-color-banner",
    once: (banner) => {
      const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);
      banner.setPosition(pixelCoord.x + 4, pixelCoord.y + yOffset);
      banner.setDepth(depthFromPosition(position, RenderDepth.UI5));
    },
  });
}

export function drawGoldBar(
  layer: PhaserLayer,
  update: ComponentUpdate & {
    type: UpdateType;
  },
  xOffset: number,
  yOffset: number,
) {
  const {
    parentLayers: {
      local: {
        components: { LocalPosition },
      },
      network: {
        components: { ChargeCap },
      },
    },
    scenes: {
      Main: {
        objectPool,
        config,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    api: { depthFromPosition },
  } = layer;
  const { entity, type } = update;

  if (type === UpdateType.Exit) {
    objectPool.remove(`${entity}-gold-bar`);
    return;
  }

  const position = getComponentValueStrict(LocalPosition, entity);
  const { totalCharged, cap } = getComponentValueStrict(ChargeCap, entity);

  if (totalCharged >= cap) {
    objectPool.remove(`${entity}-gold-bar`);
    return;
  }

  let percent = 1 - totalCharged / cap;
  // percent is 0 when totalCharged == cap
  if (totalCharged === 0) {
    percent = 1;
  }

  const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);

  const goldBarSprite = config.sprites[Sprites.GoldBar];
  const goldObj = objectPool.get(`${entity}-gold-bar`, "Sprite");
  goldObj.setComponent({
    id: `${entity}-gold-bar`,
    once: (gold) => {
      gold.setTexture(goldBarSprite.assetKey, goldBarSprite.frame);
      gold.setPosition(pixelCoord.x + xOffset, pixelCoord.y + yOffset + 2);
      gold.setDepth(depthFromPosition(position, RenderDepth.UI5 + 6));
      gold.setScale(percent, 1);
    },
  });
}

export function drawHealthBar(
  layer: PhaserLayer,
  update: ComponentUpdate & {
    type: UpdateType;
  },
  xOffset: number,
  yOffset: number,
) {
  const {
    components: { IncomingDamage },
    parentLayers: {
      network: {
        components: { Combat },
      },
      local: {
        components: { LocalPosition, LocalHealth },
      },
      headless: {
        components: { NextPosition },
      },
    },
    scenes: {
      Main: {
        objectPool,
        config,
        phaserScene,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    api: { depthFromPosition },
  } = layer;

  const { entity, type } = update;

  if (type === UpdateType.Exit) {
    for (let i = 0; i < 18; i++) {
      objectPool.remove(`${entity}-health-tick-${i}`);
      objectPool.remove(`${entity}-health-loss-tick-${i}`);
    }

    objectPool.remove(`${entity}-health-bar`);
    objectPool.remove(`${entity}-health-loss`);
  } else if ([UpdateType.Enter, UpdateType.Update].includes(type)) {
    for (let i = 0; i < 18; i++) {
      objectPool.remove(`${entity}-health-tick-${i}`);
    }

    let position = getComponentValueStrict(LocalPosition, entity);
    if (hasComponent(NextPosition, entity)) position = getComponentValueStrict(NextPosition, entity);

    const maxHealth = getComponentValueStrict(Combat, entity).maxHealth;
    const health = getComponentValueStrict(LocalHealth, entity).value;
    const currentHealthPercentage = health / maxHealth;
    const healthBarFrameSprite = config.sprites[Sprites.BarBackground as 0];
    const healthBarSprite = config.sprites[Sprites.HealthBarTick];
    const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);

    const totalTicks = 18;
    const currentHealthTicks = Math.round(currentHealthPercentage * totalTicks);

    const depth = depthFromPosition(position, RenderDepth.UI5 + 6);
    for (let i = 0; i < currentHealthTicks; i++) {
      const healthBarTick = objectPool.get(`${entity}-health-tick-${i}`, "Sprite");
      healthBarTick.setComponent({
        id: `health-tick`,
        once: (healthBarTick) => {
          healthBarTick.setTexture(healthBarSprite.assetKey, healthBarSprite.frame);
          healthBarTick.setPosition(pixelCoord.x + xOffset + i, pixelCoord.y + yOffset);
          healthBarTick.setDepth(depth);
        },
      });
    }

    const healthBarFrame = objectPool.get(`${entity}-health-bar`, "Sprite");
    healthBarFrame.setComponent({
      id: "health-bar",
      once: (healthBarFrame) => {
        healthBarFrame.setTexture(healthBarFrameSprite.assetKey, healthBarFrameSprite.frame);
        healthBarFrame.setPosition(pixelCoord.x + xOffset, pixelCoord.y + yOffset);
        healthBarFrame.setDepth(depthFromPosition(position, RenderDepth.UI5 + 4));
      },
    });

    if (isComponentUpdate(update, IncomingDamage)) {
      const { value } = update;
      const [current, previous] = value;
      const damage = current?.values.reduce((acc, v) => acc + v, 0) ?? 0;

      if (damage === previous?.value) return;
      if (damage === 0) {
        for (let i = 0; i < 18; i++) {
          objectPool.remove(`${entity}-health-loss-tick-${i}`);
        }
        return;
      }

      const percentLoss = Math.min(damage, health) / maxHealth;
      const healthBarRedSprite = config.sprites[Sprites.HealthBarRedTick];

      const numHealthLossTicks = Math.round(percentLoss * totalTicks);
      const startX = pixelCoord.x + xOffset + currentHealthTicks - numHealthLossTicks;

      for (let i = 0; i < numHealthLossTicks; i++) {
        const healthBarTick = objectPool.get(`${entity}-health-loss-tick-${i}`, "Sprite");
        healthBarTick.setComponent({
          id: `health-tick`,
          once: (incomingDamageTick) => {
            incomingDamageTick.setTexture(healthBarRedSprite.assetKey, healthBarRedSprite.frame);
            incomingDamageTick.setPosition(startX + i, pixelCoord.y + yOffset);
            incomingDamageTick.setDepth(depthFromPosition(position, RenderDepth.UI5 + 8));
            phaserScene.tweens.add({
              targets: incomingDamageTick,
              alpha: 0.5,
              duration: 500,
              ease: Phaser.Math.Easing.Quadratic.InOut,
              repeat: -1,
              yoyo: true,
            });
          },
        });
      }
    }

    if (isComponentUpdate(update, LocalHealth)) {
      const { value } = update;
      const [current, previous] = value.map((v) => (v?.value as number) ?? 0);

      if (current >= previous) {
        // for (let i = 0; i < 18; i++) {
        //   objectPool.remove(`${entity}-health-loss-tick-${i}`);
        // }
        return;
      }

      if (current < previous) {
        const previousHealthPercentage = previous / maxHealth;
        const percentDifference = previousHealthPercentage - currentHealthPercentage;
        const startX = pixelCoord.x + xOffset + currentHealthPercentage * 19;

        const healthBarRedSprite = config.sprites[Sprites.HealthBarRedTick];
        const numHealthLossTicks = Math.round(percentDifference * totalTicks);

        for (let i = 0; i < numHealthLossTicks; i++) {
          const healthBarTick = objectPool.get(`${entity}-health-loss-anim-tick-${i}`, "Sprite");
          healthBarTick.setComponent({
            id: `health-tick`,
            once: (healthBarTick) => {
              healthBarTick.setTexture(healthBarRedSprite.assetKey, healthBarRedSprite.frame);
              healthBarTick.setPosition(startX + i, pixelCoord.y + yOffset);
              healthBarTick.setDepth(depthFromPosition(position, RenderDepth.UI5 + 8));

              phaserScene.tweens.add({
                targets: healthBarTick,
                y: pixelCoord.y + yOffset - 3,
                duration: (numHealthLossTicks - i) * 50 + 100,
                ease: Phaser.Math.Easing.Quadratic.Out,
                onComplete: () => {
                  objectPool.remove(`${entity}-health-loss-anim-tick-${i}`);
                },
              });
            },
          });
        }
      }
    }
  }
}
