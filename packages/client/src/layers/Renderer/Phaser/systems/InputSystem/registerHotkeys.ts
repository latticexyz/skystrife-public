import { PhaserLayer } from "../../types";
import { InputUtils } from "./createInputSystem";

export function registerHotkeys(layer: PhaserLayer, { getSelectedEntity, getHighlightedEntity }: InputUtils) {
  const {
    parentLayers: {
      local: {
        api: { getPreferences, persistPreferences },
      },
      headless: {
        api: { attack },
      },
    },
    uiState,
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

  input.onKeyPress(
    (keys) => keys.has("M"),
    () => {
      uiState.map.fullscreen = !uiState.map.fullscreen;
    }
  );

  input.onKeyPress(
    (keys) => keys.has("ESC"),
    () => {
      const currentPreferences = getPreferences();
      persistPreferences({ ...currentPreferences, showPreferences: !currentPreferences.showPreferences });
    }
  );
}
