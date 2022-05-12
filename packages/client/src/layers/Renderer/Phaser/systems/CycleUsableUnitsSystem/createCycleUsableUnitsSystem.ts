import { defineSystem, Entity, Has, Not, UpdateType } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";

export function createCycleUsableUnitsSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { Position, OwnedBy, Stamina },
        utils: { isOwnedByCurrentPlayer },
      },
      headless: {
        components: { LocalStamina, OnCooldown },
        api: { getCurrentStamina, unitSort, getActionStaminaCost },
      },
    },
    scenes: {
      Main: { input },
    },
    api: { selectAndView },
  } = layer;

  let ownedUnitsWithStamina = new Set<Entity>();
  let lastSelectedUnitIndex = -1;

  defineSystem(
    world,
    [Has(Position), Has(OwnedBy), Has(Stamina), Has(LocalStamina), Not(OnCooldown)],
    ({ entity, type }) => {
      if (type === UpdateType.Exit) {
        ownedUnitsWithStamina.delete(entity);
        return;
      }

      const currentStamina = getCurrentStamina(entity);
      if (currentStamina < getActionStaminaCost()) {
        ownedUnitsWithStamina.delete(entity);
        return;
      }

      if (isOwnedByCurrentPlayer(entity)) {
        ownedUnitsWithStamina.add(entity);
      }

      ownedUnitsWithStamina = new Set([...ownedUnitsWithStamina].sort(unitSort));
    }
  );

  input.onKeyPress(
    (keys) => keys.has("TAB"),
    () => {
      lastSelectedUnitIndex++;
      const units = [...ownedUnitsWithStamina];
      if (lastSelectedUnitIndex >= units.length) lastSelectedUnitIndex = 0;
      const unit = units[lastSelectedUnitIndex];
      selectAndView(unit);
    }
  );
}
