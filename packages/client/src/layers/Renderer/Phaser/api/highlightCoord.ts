import { WorldCoord } from "phaserx/src/types";
import { getComponentValue, setComponent } from "@latticexyz/recs";
import { PhaserLayer } from "../types";
import { worldCoordEq } from "../../../../utils/coords";
import { singletonEntity } from "@latticexyz/store-sync/recs";

export function highlightCoord(layer: PhaserLayer, coord: WorldCoord) {
  const {
    components: { HoverHighlight, PreviousHoverHighlight },
  } = layer;

  const previousHighlight = getComponentValue(HoverHighlight, singletonEntity);
  if (previousHighlight) {
    const previousCoord = { x: previousHighlight.x, y: previousHighlight.y };
    if (worldCoordEq(previousCoord, coord)) return;

    setComponent(PreviousHoverHighlight, singletonEntity, { x: previousHighlight.x, y: previousHighlight.y });
  }

  setComponent(HoverHighlight, singletonEntity, { ...coord });
}
