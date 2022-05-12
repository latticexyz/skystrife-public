import {
  defineSystem,
  getComponentValueStrict,
  Has,
  removeComponent,
  setComponent,
  UpdateType,
} from "@latticexyz/recs";
import { Assets, TILE_HEIGHT } from "../../phaserConstants";
import { PhaserLayer, RenderDepth } from "../../types";
import { singletonEntity } from "@latticexyz/store-sync/recs";

export function createConstrainCameraSystem(layer: PhaserLayer) {
  const {
    world,
    components: { MapBounds },
    parentLayers: {
      local: {
        components: { LocalPosition, Preferences },
      },
      network: {
        components: { TerrainType },
      },
    },
    scenes: {
      Main: {
        camera,
        phaserScene,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = layer;

  let maxX = -Infinity;
  let maxY = -Infinity;
  let minX = Infinity;
  let minY = Infinity;

  const EDGE_BUFFER_PIXELS = TILE_HEIGHT * 12;

  let backgroundTiles: Phaser.GameObjects.Group | undefined;
  let clouds: Phaser.GameObjects.Group | undefined;
  const BACKGROUND_TILE_SIZE = {
    x: 1500,
    y: 1000,
  };

  // draw background tiles
  defineSystem(world, [Has(MapBounds), Has(Preferences)], ({ type, entity }) => {
    if (type === UpdateType.Exit) return;

    const { disableBackground } = getComponentValueStrict(Preferences, entity);

    backgroundTiles?.clear(true);
    if (disableBackground) return;

    backgroundTiles = phaserScene.add.group();

    const {
      top: topEdge,
      bottom: bottomEdge,
      left: leftEdge,
      right: rightEdge,
    } = getComponentValueStrict(MapBounds, entity);

    const constraintSize = {
      x: rightEdge - leftEdge,
      y: bottomEdge - topEdge,
    };
    const numXTiles = Math.ceil(constraintSize.x / BACKGROUND_TILE_SIZE.x) + 1;
    const numYTiles = Math.ceil(constraintSize.y / BACKGROUND_TILE_SIZE.y) + 1;

    for (let i = 0; i < numXTiles; i++) {
      for (let j = 0; j < numYTiles; j++) {
        const bgTile = phaserScene.add.image(
          i * BACKGROUND_TILE_SIZE.x,
          j * BACKGROUND_TILE_SIZE.y,
          Assets.TiledBackground,
          0
        );
        bgTile.setDepth(RenderDepth.Background5);
        bgTile.setScrollFactor(0.3);
        backgroundTiles.add(bgTile, false);
      }
    }
  });

  // draw clouds
  defineSystem(world, [Has(MapBounds), Has(Preferences)], ({ type, entity }) => {
    if (type === UpdateType.Exit) return;

    const { disableClouds } = getComponentValueStrict(Preferences, entity);

    clouds?.clear(true);
    if (disableClouds) return;

    clouds = phaserScene.add.group();

    const {
      top: topEdge,
      bottom: bottomEdge,
      left: leftEdge,
      right: rightEdge,
    } = getComponentValueStrict(MapBounds, entity);

    const targetCloudSpeedPixelsPerMillisecond = 0.02;
    const duration = (rightEdge - leftEdge) / targetCloudSpeedPixelsPerMillisecond;

    const cloudImage = phaserScene.add.image(leftEdge, topEdge, Assets.CloudBackground, 0);
    clouds.add(cloudImage, false);
    cloudImage.setX(leftEdge - cloudImage.width);
    cloudImage.setY(topEdge - cloudImage.height);
    cloudImage.setDepth(RenderDepth.Background4 - 2);
    cloudImage.setScrollFactor(0.5);
    phaserScene.add.tween({
      targets: cloudImage,
      x: {
        from: cloudImage.x + cloudImage.width,
        to: rightEdge,
      },
      y: {
        from: cloudImage.y + cloudImage.height,
        to: bottomEdge,
      },
      repeat: -1,
      yoyo: false,
      duration: duration,
      ease: Phaser.Math.Easing.Linear,
    });

    const cloudImage2 = phaserScene.add.image(leftEdge + 500, topEdge, Assets.CloudBackground, 0);
    clouds.add(cloudImage2, false);
    cloudImage2.setScale(0.6);
    cloudImage2.setX(leftEdge - cloudImage2.width);
    cloudImage2.setY(topEdge - cloudImage2.height);
    cloudImage2.setDepth(RenderDepth.Background4 - 4);
    cloudImage2.setScrollFactor(0.4);
    phaserScene.add.tween({
      targets: cloudImage2,
      x: {
        from: cloudImage2.x + cloudImage2.width,
        to: rightEdge,
      },
      y: {
        from: cloudImage2.y + cloudImage2.height,
        to: bottomEdge,
      },
      repeat: -1,
      yoyo: false,
      duration: duration * 1.1,
      ease: Phaser.Math.Easing.Linear,
    });

    const cloudImage3 = phaserScene.add.image(leftEdge, topEdge + 500, Assets.CloudBackground, 0);
    clouds.add(cloudImage3, false);
    cloudImage3.setScale(0.3);
    cloudImage3.setX(leftEdge - cloudImage3.width);
    cloudImage3.setY(topEdge - cloudImage3.height);
    cloudImage3.setDepth(RenderDepth.Background4 - 6);
    cloudImage3.setScrollFactor(0.3);
    phaserScene.add.tween({
      targets: cloudImage3,
      x: {
        from: cloudImage3.x + cloudImage3.width,
        to: rightEdge,
      },
      y: {
        from: cloudImage3.y + cloudImage3.height,
        to: bottomEdge,
      },
      repeat: -1,
      yoyo: false,
      duration: duration * 1.2,
      ease: Phaser.Math.Easing.Linear,
    });
  });

  defineSystem(world, [Has(LocalPosition), Has(TerrainType)], ({ type, entity }) => {
    if (type === UpdateType.Exit) return;

    const position = getComponentValueStrict(LocalPosition, entity);

    let boundsChanged = false;
    if (position.x > maxX) {
      boundsChanged = true;
      maxX = position.x;
    }
    if (position.y > maxY) {
      boundsChanged = true;
      maxY = position.y;
    }
    if (position.x < minX) {
      boundsChanged = true;
      minX = position.x;
    }
    if (position.y < minY) {
      boundsChanged = true;
      minY = position.y;
    }

    if (boundsChanged) {
      const leftEdge = minX * tileWidth - EDGE_BUFFER_PIXELS;
      const topEdge = minY * tileHeight - EDGE_BUFFER_PIXELS;
      const bottomEdge = (maxX + Math.abs(minX)) * tileWidth + EDGE_BUFFER_PIXELS * 2;
      const rightEdge = (maxY + Math.abs(minY)) * tileWidth + EDGE_BUFFER_PIXELS * 2;

      camera.phaserCamera.setBounds(
        minX * tileWidth - EDGE_BUFFER_PIXELS,
        minY * tileHeight - EDGE_BUFFER_PIXELS,
        (maxX + Math.abs(minX)) * tileWidth + EDGE_BUFFER_PIXELS * 2,
        (maxY + Math.abs(minY)) * tileWidth + EDGE_BUFFER_PIXELS * 2
      );

      const centerX = minX - maxX / 2;
      const centerY = minY - maxY / 2;
      camera.phaserCamera.centerOn(centerX, centerY);

      setComponent(MapBounds, singletonEntity, { top: topEdge, bottom: bottomEdge, left: leftEdge, right: rightEdge });
    }
  });

  // hack to make the background appear when there is no map
  setComponent(LocalPosition, singletonEntity, { x: 0, y: 0 });
  removeComponent(LocalPosition, singletonEntity);
}
