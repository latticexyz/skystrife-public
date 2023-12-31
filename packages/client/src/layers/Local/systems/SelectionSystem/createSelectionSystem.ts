import {
  removeComponent,
  setComponent,
  defineComponentSystem,
  getComponentEntities,
  runQuery,
  HasValue,
  Has,
} from "@latticexyz/recs";
import { LocalLayer } from "../../types";

/**
 * The Selection system handles selecting all selectable entities in the selected area
 */
export function createSelectionSystem(layer: LocalLayer) {
  const {
    world,
    components: { LocalPosition, Selection, Selected, Selectable },
    parentLayers: {
      headless: {
        components: { InCurrentMatch },
      },
    },
  } = layer;

  // Get all selectable entities in the selected area
  defineComponentSystem(world, Selection, ({ value }) => {
    const selection = value[0];
    if (!selection) return;

    // If the selection is empty, unselect all currently selected entities
    if (selection.width === 0 || selection.height === 0) {
      for (const entity of getComponentEntities(Selected)) {
        removeComponent(Selected, entity);
      }
      return;
    }

    const entitiesAtPosition = runQuery([
      Has(Selectable),
      HasValue(LocalPosition, { x: selection.x, y: selection.y }),
      Has(InCurrentMatch),
    ]);
    for (const entity of entitiesAtPosition) {
      setComponent(Selected, entity, { value: true });
    }
  });
}
