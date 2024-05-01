import { Entity, getComponentValue, getComponentValueStrict, hasComponent } from "@latticexyz/recs";
import { PhaserLayer, RenderDepth } from "../../types";
import { Sprites } from "../../phaserConstants";
import { tileCoordToPixelCoord } from "phaserx";

export function createHealthBar(layer: PhaserLayer, entity: Entity, xOffset: number, yOffset: number) {
  const {
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
        config,
        phaserScene,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    api: { depthFromPosition },
    globalObjectPool,
  } = layer;

  const totalTicks = 18;
  const maxHealth = getComponentValueStrict(Combat, entity).maxHealth;

  const drawCurrentHealth = () => {
    let position = getComponentValue(LocalPosition, entity);
    if (hasComponent(NextPosition, entity)) position = getComponentValueStrict(NextPosition, entity);
    if (!position) return;

    const healthBar = globalObjectPool.get(`${entity}-health-bar`, "Sprite");

    const health = getComponentValue(LocalHealth, entity)?.value ?? 0;
    const currentHealthPercentage = health / maxHealth;

    const healthBarSprite = config.sprites[Sprites.HealthBar];
    const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);

    const currentHealthTicks = Math.round(currentHealthPercentage * totalTicks);
    const depth = depthFromPosition(position, RenderDepth.UI5 + 6);

    healthBar.setPosition(pixelCoord.x + xOffset, pixelCoord.y + yOffset);
    healthBar.setTexture(healthBarSprite.assetKey, healthBarSprite.frame);
    healthBar.setDepth(depth);
    healthBar.setOrigin(0, 0);

    const healthBarMask = globalObjectPool.get(`${entity}-mask`, "Graphics");
    healthBarMask.clear();
    healthBarMask.fillStyle(0xffffff);
    healthBarMask.fillRect(pixelCoord.x + xOffset, pixelCoord.y + yOffset, currentHealthTicks, healthBar.height);
    healthBar.setMask(healthBarMask.createGeometryMask());

    const healthBarBackgroundSprite = config.sprites[Sprites.BarBackground as 0];
    const healthBarBackground = globalObjectPool.get(`${entity}-background`, "Sprite");
    healthBarBackground.setOrigin(0, 0);
    healthBarBackground.setTexture(healthBarBackgroundSprite.assetKey, healthBarBackgroundSprite.frame);
    healthBarBackground.setPosition(pixelCoord.x + xOffset, pixelCoord.y + yOffset);
    healthBarBackground.setDepth(depthFromPosition(position, RenderDepth.UI5 + 4));
  };

  const drawIncomingDamage = (damage: number) => {
    const incomingDamageBar = globalObjectPool.get(`${entity}-incoming-damage`, "Sprite");

    let position = getComponentValueStrict(LocalPosition, entity);
    if (hasComponent(NextPosition, entity)) position = getComponentValueStrict(NextPosition, entity);

    const health = getComponentValue(LocalHealth, entity)?.value;
    if (health == undefined) return;

    const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);

    const percentLoss = Math.min(damage, health) / maxHealth;
    const healthBarRedSprite = config.sprites[Sprites.HealthBarRed];

    const currentHealthPercentage = health / maxHealth;
    const currentHealthTicks = Math.round(currentHealthPercentage * totalTicks);
    const numHealthLossTicks = Math.round(percentLoss * totalTicks);
    const startX = pixelCoord.x + xOffset + currentHealthTicks - numHealthLossTicks;

    const incomingDamageMask = globalObjectPool.get(`${entity}-incoming-mask`, "Graphics");
    incomingDamageMask.clear();
    incomingDamageMask.fillStyle(0xffffff);
    incomingDamageMask.fillRect(startX, pixelCoord.y + yOffset, numHealthLossTicks, incomingDamageBar.height);
    incomingDamageBar.setMask(incomingDamageMask.createGeometryMask());

    incomingDamageBar.setPosition(startX, pixelCoord.y + yOffset);
    incomingDamageBar.setOrigin(0, 0);
    incomingDamageBar.setTexture(healthBarRedSprite.assetKey, healthBarRedSprite.frame);
    incomingDamageBar.setDepth(depthFromPosition(position, RenderDepth.UI5 + 8));
  };

  const destroy = () => {
    globalObjectPool.remove(`${entity}-health-bar`);
    globalObjectPool.remove(`${entity}-mask`);
    globalObjectPool.remove(`${entity}-incoming-mask`);
    globalObjectPool.remove(`${entity}-background`);
    globalObjectPool.remove(`${entity}-incoming-damage`);
  };

  return {
    drawCurrentHealth,
    drawIncomingDamage,
    destroy,
  };
}
