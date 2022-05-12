import { setComponent } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";
import { singletonEntity } from "@latticexyz/store-sync/recs";

export function registerDevModeToggle(layer: PhaserLayer) {
  const {
    parentLayers: {
      local: {
        components: { DevMode },
        api: { devModeEnabled },
      },
    },
    scenes: {
      Main: { input },
    },
  } = layer;

  input.onKeyPress(
    (keys) => keys.has("BACKTICK"),
    () => {
      setComponent(DevMode, singletonEntity, { value: !devModeEnabled() });
    }
  );
}
