import { BehaviorSubject } from "rxjs";
import { tileCoordToPixelCoord } from "./utils";
import { Camera, Coord, ObjectPool } from "./types";

export function createCamera(phaserCamera: Phaser.Cameras.Scene2D.Camera): Camera {
  // Stop default gesture events to not collide with use-gesture
  // https://github.com/pmndrs/use-gesture/blob/404e2b2ac145a45aff179c1faf5097b97414731c/documentation/pages/docs/gestures.mdx#about-the-pinch-gesture
  document.addEventListener("gesturestart", (e) => e.preventDefault());
  document.addEventListener("gesturechange", (e) => e.preventDefault());

  const worldView$ = new BehaviorSubject<Phaser.Cameras.Scene2D.Camera["worldView"]>(phaserCamera.worldView);
  const zoom$ = new BehaviorSubject<number>(phaserCamera.zoom);

  const onResize = () => {
    requestAnimationFrame(() => worldView$.next(phaserCamera.worldView));
  };
  phaserCamera.scene.scale.addListener("resize", onResize);

  function setZoom(zoom: number) {
    phaserCamera.setZoom(zoom);
    worldView$.next(phaserCamera.worldView);
    zoom$.next(zoom);
  }

  function ignore(objectPool: ObjectPool, ignore: boolean) {
    objectPool.ignoreCamera(phaserCamera.id, ignore);
  }

  function centerOnCoord(tileCoord: Coord, tileWidth: number, tileHeight: number) {
    const pixelCoord = tileCoordToPixelCoord(tileCoord, tileWidth, tileHeight);
    centerOn(pixelCoord.x, pixelCoord.y);
  }

  function centerOn(x: number, y: number) {
    phaserCamera.centerOn(Math.floor(x), Math.floor(y));
    requestAnimationFrame(() => worldView$.next(phaserCamera.worldView));
  }

  function setScroll(x: number, y: number) {
    phaserCamera.setScroll(Math.floor(x), Math.floor(y));
    requestAnimationFrame(() => worldView$.next(phaserCamera.worldView));
  }

  return {
    phaserCamera,
    worldView$,
    zoom$,
    ignore,
    dispose: () => {
      phaserCamera.scene.scale.removeListener("resize", onResize);
    },
    centerOnCoord,
    centerOn,
    setScroll,
    setZoom,
  };
}
