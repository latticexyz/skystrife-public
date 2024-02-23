import { ObservableMap } from "mobx";
import { createPhaserLayer } from "./createPhaserLayer";

export interface Scene {
  scene: Phaser.Scene;
  map: Phaser.Tilemaps.Tilemap;
}

export type SceneMaps = ObservableMap<number, Phaser.Tilemaps.Tilemap>;

export type PhaserLayer = Awaited<ReturnType<typeof createPhaserLayer>>;

export interface PixelCoord {
  x: number;
  y: number;
}

export enum RenderDepth {
  AlwaysOnTop = 10_000,

  UI1 = 75,
  UI2 = 70,
  UI3 = 65,
  UI4 = 60,
  UI5 = 55,

  Foreground1 = 50,
  Foreground2 = 45,
  Foreground3 = 40,
  Foreground4 = 35,
  Foreground5 = 30,

  Background1 = 20,
  Background2 = 10,
  Background3 = 0, // tilemap sits here
  Background4 = -10,
  Background5 = -20,
}
