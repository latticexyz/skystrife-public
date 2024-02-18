import { PhaserLayer } from "../../types";
import { InputUtils } from "./createInputSystem";

export function registerHotkeys(layer: PhaserLayer, { getSelectedEntity, getHighlightedEntity }: InputUtils) {
  const {
    parentLayers: {
      headless: {
        api: { attack },
      },
    },
    scenes: {
      Main: { input },
    },
  } = layer;

  input.onKeyPress(
    (keys) => keys.has("A"),
    () => {
      const selectedEntity = getSelectedEntity();
      if (!selectedEntity) return;

      const highlightedEntity = getHighlightedEntity();
      if (!highlightedEntity) return;

      attack(selectedEntity, highlightedEntity);
    }
  );
}
