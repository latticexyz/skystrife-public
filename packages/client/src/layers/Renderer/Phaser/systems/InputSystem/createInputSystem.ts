import { PhaserLayer } from "../../types";
import { Entity, getComponentValue, Has, HasValue, runQuery } from "@latticexyz/recs";
import { registerCameraControls } from "./registerCameraControls";
import { registerClicks } from "./registerClicks";
import { registerHotkeys } from "./registerHotkeys";
import { registerHoverIcon } from "./registerHoverIcon";
import { registerDevModeToggle } from "./registerDevModeToggle";
import { WorldCoord } from "phaserx/src/types";
import { singletonEntity } from "@latticexyz/store-sync/recs";

export type InputUtils = {
  getSelectedEntity: () => Entity | undefined;
  getHighlightedEntity: () => Entity | undefined;
  getHoverPosition: () => WorldCoord | undefined;
};

export function createInputSystem(layer: PhaserLayer) {
  const {
    components: { HoverHighlight },
    parentLayers: {
      headless: {
        components: { InCurrentMatch },
      },
      local: {
        components: { Selected, LocalPosition, Interactable },
      },
    },
  } = layer;

  const inputUtils: InputUtils = {
    getSelectedEntity: () => [...runQuery([Has(Selected)])][0],
    getHighlightedEntity: () => {
      const hoverHighlight = getComponentValue(HoverHighlight, singletonEntity);
      if (!hoverHighlight) return;

      const highlightedEntity = [
        ...runQuery([
          Has(InCurrentMatch),
          HasValue(LocalPosition, { x: hoverHighlight.x, y: hoverHighlight.y }),
          Has(Interactable),
        ]),
      ][0];

      return highlightedEntity;
    },
    getHoverPosition: () => {
      const hoverHighlight = getComponentValue(HoverHighlight, singletonEntity);
      if (!hoverHighlight) return;

      return {
        x: hoverHighlight.x,
        y: hoverHighlight.y,
      };
    },
  };

  registerDevModeToggle(layer);

  registerCameraControls(layer);
  registerClicks(layer, inputUtils);
  registerHotkeys(layer, inputUtils);
  registerHoverIcon(layer, inputUtils);
}
