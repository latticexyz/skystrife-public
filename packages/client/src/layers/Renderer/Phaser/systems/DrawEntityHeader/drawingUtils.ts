import { tileCoordToPixelCoord } from "phaserx";
import { ComponentUpdate, Entity, getComponentValueStrict, UpdateType } from "@latticexyz/recs";
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
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    globalObjectPool,
  } = layer;

  const bannerId = `${entity}-player-color-banner`;
  globalObjectPool.remove(bannerId);

  if (type === UpdateType.Exit) {
    return;
  }

  const color = getOwnerColor(entity, matchEntity);
  const position = getComponentValueStrict(LocalPosition, entity);

  playTintedAnimation(bannerId as Entity, Animations.Banner, color.name);

  const sprite = globalObjectPool.get(bannerId, "Sprite");
  const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);
  sprite.setPosition(pixelCoord.x + 4, pixelCoord.y + yOffset);
  sprite.setDepth(depthFromPosition(position, RenderDepth.UI5));
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
        config,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    api: { depthFromPosition },
    globalObjectPool,
  } = layer;
  const { entity, type } = update;
  globalObjectPool.remove(`${entity}-gold-bar`);

  if (type === UpdateType.Exit) {
    return;
  }

  const position = getComponentValueStrict(LocalPosition, entity);
  const { totalCharged, cap } = getComponentValueStrict(ChargeCap, entity);

  if (totalCharged >= cap) {
    globalObjectPool.remove(`${entity}-gold-bar`);
    return;
  }

  let percent = 1 - totalCharged / cap;
  // percent is 0 when totalCharged == cap
  if (totalCharged === 0) {
    percent = 1;
  }

  const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);

  const goldBarSprite = config.sprites[Sprites.GoldBar];
  const sprite = globalObjectPool.get(`${entity}-gold-bar`, "Sprite");
  sprite.setTexture(goldBarSprite.assetKey, goldBarSprite.frame);
  sprite.setPosition(pixelCoord.x + xOffset, pixelCoord.y + yOffset + 2);
  sprite.setDepth(depthFromPosition(position, RenderDepth.UI5 + 6));
  sprite.setScale(percent, 1);
}
