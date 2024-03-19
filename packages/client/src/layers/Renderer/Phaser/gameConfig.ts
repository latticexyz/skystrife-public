import { defineSceneConfig, AssetType, defineScaleConfig, defineMapConfig, defineCameraConfig } from "phaserx";
import { Assets, Maps, Scenes, TILE_HEIGHT, TILE_WIDTH } from "./phaserConstants";
import { Tileset, TileAnimations } from "./tilesets/overworld";
import overworldTileset from "../../../public/tilesets/overworld.png";
import { getAnimations } from "./animationConfig";
import { getSprites } from "./spriteConfig";

const ANIMATION_INTERVAL = 200;
export const MAX_CAMERA_ZOOM = 3;
export const MIN_CAMERA_ZOOM = 1;

export const gameConfig = {
  sceneConfig: {
    [Scenes.Main]: defineSceneConfig({
      assets: {
        [Assets.OverworldTileset]: { type: AssetType.Image, key: Assets.OverworldTileset, path: overworldTileset },
        [Assets.MainAtlas]: {
          type: AssetType.MultiAtlas,
          key: Assets.MainAtlas,
          // Add a timestamp to the end of the path to prevent caching
          path: `/public/atlases/sprites/atlas.json?timestamp=${Date.now()}`,
          options: {
            imagePath: "/public/atlases/sprites/",
          },
        },
        [Assets.Background]: {
          type: AssetType.Image,
          key: Assets.Background,
          path: "/public/assets/background.png",
        },
        [Assets.CloudBackground]: {
          type: AssetType.Image,
          key: Assets.CloudBackground,
          path: "/public/assets/cloud-background.png",
        },
        [Assets.Cloud1]: {
          type: AssetType.Image,
          key: Assets.Cloud1,
          path: "/public/assets/cloud-1.png",
        },
        [Assets.Cloud2]: {
          type: AssetType.Image,
          key: Assets.Cloud2,
          path: "/public/assets/cloud-2.png",
        },
        [Assets.TiledBackground]: {
          type: AssetType.Image,
          key: Assets.TiledBackground,
          path: "/public/assets/tiled-background-4.png",
        },
        [Assets.MinimapBackground]: {
          type: AssetType.Image,
          key: Assets.MinimapBackground,
          path: "/public/assets/minimap-background.png",
        },
        [Assets.Professor]: {
          type: AssetType.Image,
          key: Assets.Professor,
          path: "/public/assets/professor.png",
        },
        [Assets.Gold]: {
          type: AssetType.Image,
          key: Assets.Gold,
          path: "/public/assets/gold.png",
        },
        [Assets.Central]: {
          type: AssetType.Image,
          key: Assets.Central,
          path: "/public/assets/depth/central.png",
        },
        [Assets.LeftMid]: {
          type: AssetType.Image,
          key: Assets.LeftMid,
          path: "/public/assets/depth/left-mid.png",
        },
        [Assets.RightMid]: {
          type: AssetType.Image,
          key: Assets.RightMid,
          path: "/public/assets/depth/right-mid.png",
        },
        [Assets.LeftCornerUpA]: {
          type: AssetType.Image,
          key: Assets.LeftCornerUpA,
          path: "/public/assets/depth/left-corner-up-a.png",
        },
        [Assets.LeftCornerUpB]: {
          type: AssetType.Image,
          key: Assets.LeftCornerUpB,
          path: "/public/assets/depth/left-corner-up-b.png",
        },
        [Assets.RightCornerUpA]: {
          type: AssetType.Image,
          key: Assets.RightCornerUpA,
          path: "/public/assets/depth/right-corner-up-a.png",
        },
        [Assets.RightCornerUpB]: {
          type: AssetType.Image,
          key: Assets.RightCornerUpB,
          path: "/public/assets/depth/right-corner-up-b.png",
        },
        [Assets.LeftEdge]: {
          type: AssetType.Image,
          key: Assets.LeftEdge,
          path: "/public/assets/depth/left-edge.png",
        },
        [Assets.RightEdge]: {
          type: AssetType.Image,
          key: Assets.RightEdge,
          path: "/public/assets/depth/right-edge.png",
        },
        [Assets.UpperEdge]: {
          type: AssetType.Image,
          key: Assets.UpperEdge,
          path: "/public/assets/depth/upper-edge.png",
        },
        [Assets.UpperEdgeLeft]: {
          type: AssetType.Image,
          key: Assets.UpperEdgeLeft,
          path: "/public/assets/depth/upper-corner-left.png",
        },
        [Assets.UpperEdgeRight]: {
          type: AssetType.Image,
          key: Assets.UpperEdgeRight,
          path: "/public/assets/depth/upper-corner-right.png",
        },
      },
      maps: {
        [Maps.Main]: defineMapConfig({
          chunkSize: TILE_WIDTH * 64, // tile size * tile amount
          tileWidth: TILE_WIDTH,
          tileHeight: TILE_HEIGHT,
          backgroundTile: [Tileset.Blank],
          animationInterval: ANIMATION_INTERVAL,
          tileAnimations: TileAnimations,
          layers: {
            layers: {
              Background: { tilesets: ["Default"] },
              Foreground: { tilesets: ["Default"] },
            },
            defaultLayer: "Background",
          },
        }),
      },
      sprites: getSprites(),
      animations: getAnimations(),
      tilesets: {
        Default: { assetKey: Assets.OverworldTileset, tileWidth: TILE_WIDTH, tileHeight: TILE_HEIGHT },
      },
    }),
    [Scenes.UI]: defineSceneConfig({
      assets: {},
      maps: {},
      animations: [],
      tilesets: {},
      sprites: {},
    }),
  },
  scale: defineScaleConfig({
    parent: "phaser-game",
    zoom: 1,
    mode: Phaser.Scale.NONE,
  }),
  cameraConfig: defineCameraConfig({
    pinchSpeed: 1,
    wheelSpeed: 1,
    maxZoom: MAX_CAMERA_ZOOM,
    minZoom: MIN_CAMERA_ZOOM,
  }),
  cullingChunkSize: TILE_HEIGHT * 16,
};
