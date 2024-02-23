import { PhaserLayer } from "../../types";
import { InputUtils } from "./createInputSystem";

export function registerHotkeys(layer: PhaserLayer, inputUtils: InputUtils) {
  const {
    parentLayers: {
      local: {
        api: { resetSelection },
      },
    },
    scenes: {
      Main: { input },
    },
  } = layer;

  input.onKeyPress(
    (keys) => keys.has(Phaser.Input.Keyboard.KeyCodes.ESC as any),
    () => {
      resetSelection();
    }
  );
}
