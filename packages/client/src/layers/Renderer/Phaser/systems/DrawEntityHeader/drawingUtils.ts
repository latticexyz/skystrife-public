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

  const color = getOwnerColor(entity);
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
  yOffset: number
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
  yOffset: number
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
    objectPool.remove(`${entity}-health`);
    objectPool.remove(`${entity}-health-bar`);
    objectPool.remove(`${entity}-health-loss`);
  } else if ([UpdateType.Enter, UpdateType.Update].includes(type)) {
    let position = getComponentValueStrict(LocalPosition, entity);
    if (hasComponent(NextPosition, entity)) position = getComponentValueStrict(NextPosition, entity);

    const maxHealth = getComponentValueStrict(Combat, entity).maxHealth;
    const health = getComponentValueStrict(LocalHealth, entity).value;
    const currentHealthPercentage = health / maxHealth;
    const healthBarFrameSprite = config.sprites[Sprites.BarBackground as 0];
    const healthBarSprite = config.sprites[Sprites.HealthBar];
    const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);

    const healthBar = objectPool.get(`${entity}-health`, "Sprite");
    healthBar.setComponent({
      id: "health-bar",
      once: (healthBar) => {
        healthBar.setScale(currentHealthPercentage, 1);
        healthBar.setTexture(healthBarSprite.assetKey, healthBarSprite.frame);
        healthBar.setPosition(pixelCoord.x + xOffset, pixelCoord.y + yOffset);
        healthBar.setDepth(depthFromPosition(position, RenderDepth.UI5 + 6));
      },
    });

    const healthBarFrame = objectPool.get(`${entity}-health-bar`, "Sprite");
    healthBarFrame.setComponent({
      id: "health-bar-frame",
      once: (healthBarFrame) => {
        healthBarFrame.setTexture(healthBarFrameSprite.assetKey, healthBarFrameSprite.frame);
        healthBarFrame.setPosition(pixelCoord.x + xOffset, pixelCoord.y + yOffset);
        healthBarFrame.setDepth(depthFromPosition(position, RenderDepth.UI5 + 4));
      },
    });

    if (isComponentUpdate(update, IncomingDamage)) {
      const { value } = update;
      const [current, previous] = value;
      const damage = current?.value ?? 0;

      if (damage === previous?.value) return;
      if (damage === 0) return objectPool.remove(`${entity}-health-loss`);

      const percentLoss = Math.min(damage, health) / maxHealth;
      const healthBarRedSprite = config.sprites[Sprites.HealthBarRed];
      const startX = pixelCoord.x + xOffset + (1 - percentLoss) * 19 - (1 - currentHealthPercentage) * 19;

      const healthLoss = objectPool.get(`${entity}-health-loss`, "Sprite");
      healthLoss.setComponent({
        id: `${entity}-health-loss`,
        once: (healthLoss) => {
          healthLoss.setTexture(healthBarRedSprite.assetKey, healthBarRedSprite.frame);
          healthLoss.setPosition(startX, pixelCoord.y + yOffset);
          healthLoss.setDepth(depthFromPosition(position, RenderDepth.UI5 + 8));
          healthLoss.setScale(percentLoss, 1);

          // blink health bar with incoming damage
          phaserScene.tweens.add({
            targets: healthLoss,
            alpha: 0.5,
            duration: 500,
            ease: Phaser.Math.Easing.Quadratic.InOut,
            repeat: -1,
            yoyo: true,
          });
        },
      });
    }

    if (isComponentUpdate(update, LocalHealth)) {
      const { value } = update;
      const [current, previous] = value.map((v) => (v?.value as number) ?? 0);

      // Animate health loss on the health bar
      if (current < previous) {
        objectPool.remove(`${entity}-health-loss`);

        const previousHealthPercentage = previous / maxHealth;
        const percentDifference = previousHealthPercentage - currentHealthPercentage;
        const startX = pixelCoord.x + xOffset + currentHealthPercentage * 19;

        const healthBarRedSprite = config.sprites[Sprites.HealthBarRed];

        const redBar = objectPool.get(`${entity}-red-bar`, "Sprite");
        redBar.setComponent({
          id: "red-bar",
          once: (redBar) => {
            redBar.setTexture(healthBarRedSprite.assetKey, healthBarRedSprite.frame);
            redBar.setPosition(startX, pixelCoord.y + yOffset);
            redBar.setDepth(depthFromPosition(position, RenderDepth.UI5 + 5));
            redBar.setAlpha(0.6);
            redBar.setScale(percentDifference, 1);

            phaserScene.tweens.add({
              targets: redBar,
              scaleX: 0,
              duration: 800,
              ease: Phaser.Math.Easing.Quadratic.Out,
              onComplete: () => {
                objectPool.remove(`${entity}-red-bar`);
              },
            });
          },
        });
      }
    }
  }
}
