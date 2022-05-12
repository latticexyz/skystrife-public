import { throttle } from "lodash";
import { PhaserLayer } from "../types";

export function createSmoothCameraControls(layer: PhaserLayer) {
  const {
    scenes: {
      Main: { phaserScene, camera },
    },
    api: {
      mapInteraction: { mapInteractionEnabled },
    },
  } = layer;

  const createSmoothCamera = (config: Phaser.Types.Cameras.Controls.SmoothedKeyControlConfig) => {
    const controls = new Phaser.Cameras.Controls.SmoothedKeyControl(config);
    const throttledCameraRefresh = throttle(() => {
      camera.setScroll(camera.phaserCamera.scrollX, camera.phaserCamera.scrollY);
      camera.setZoom(camera.phaserCamera.zoom);
    }, 750);

    let previousTime = Date.now();
    function tickCamera(time: number) {
      const cameraTickTime = time - previousTime;
      if (mapInteractionEnabled()) controls.update(cameraTickTime);
      previousTime = time;

      throttledCameraRefresh();

      window.requestAnimationFrame(tickCamera);
    }
    requestAnimationFrame(tickCamera);
  };

  if (!phaserScene.input.keyboard) return;

  createSmoothCamera({
    camera: camera.phaserCamera,
    left: phaserScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    right: phaserScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    up: phaserScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    down: phaserScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    acceleration: 0.5,
    drag: 0.005,
    maxSpeed: 0.8,
    zoomSpeed: 0.02,
  });

  createSmoothCamera({
    camera: camera.phaserCamera,
    left: phaserScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
    right: phaserScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
    up: phaserScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
    down: phaserScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
    acceleration: 0.5,
    drag: 0.005,
    maxSpeed: 0.8,
    zoomSpeed: 0.02,
  });
}
