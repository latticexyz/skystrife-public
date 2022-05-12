import { defineRxSystem } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";

export function createScreenFlashes(layer: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: { camera },
    },
    parentLayers: {
      headless: { turn$ },
    },
  } = layer;

  defineRxSystem(world, turn$, () => {
    camera.phaserCamera.flashEffect.alpha = 0.3;
    camera.phaserCamera.flash(500);
  });
}
