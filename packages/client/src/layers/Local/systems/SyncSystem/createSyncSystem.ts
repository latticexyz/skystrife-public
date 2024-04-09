import {
  Has,
  defineSyncSystem,
  setComponent,
  defineComponentSystem,
  removeComponent,
  getComponentValue,
} from "@latticexyz/recs";
import { LocalLayer } from "../../types";
import { UnitTypeNames, StructureTypeNames, TerrainTypeNames } from "../../../Network/types";

/**
 * The Sync system handles adding Local layer components to entites based on components they have on parent layers
 */
export function createSyncSystem(layer: LocalLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { UnitType, TerrainType, StructureType, Name, Combat },
      },
    },
    components: { Selectable, LocalName, LocalHealth, Interactable },
  } = layer;

  defineSyncSystem(
    world,
    [Has(UnitType)],
    () => Selectable,
    () => ({ value: true }),
  );

  defineSyncSystem(
    world,
    [Has(StructureType)],
    () => Selectable,
    () => ({ value: true }),
  );

  defineSyncSystem(
    world,
    [Has(UnitType)],
    () => Interactable,
    () => ({ value: true }),
  );

  defineSyncSystem(
    world,
    [Has(StructureType)],
    () => Interactable,
    () => ({ value: true }),
  );

  // Only set LocalHealth the first time Combat appears
  // From this point forward, LocalHealth will be modified
  // by Combat system calls.
  defineComponentSystem(world, Combat, ({ entity, value }) => {
    const [newValue] = value;
    if (!newValue) return;

    const newHealth = newValue.health;
    const currentHealth = getComponentValue(LocalHealth, entity)?.value;

    if (currentHealth === undefined || newHealth > currentHealth)
      setComponent(LocalHealth, entity, { value: newValue.health });
  });

  defineComponentSystem(world, Name, ({ entity, value }) => {
    const [newValue] = value;
    const name = newValue?.value;

    if (name) {
      setComponent(LocalName, entity, { value: name });
    } else {
      removeComponent(LocalName, entity);
    }
  });

  defineComponentSystem(world, UnitType, ({ entity, value }) => {
    const [newValue] = value;
    const type = newValue?.value;
    if (type == null) return;

    let name = "Unknown";
    if (UnitTypeNames[type]) name = UnitTypeNames[type];

    setComponent(LocalName, entity, { value: name });
  });

  defineComponentSystem(world, StructureType, ({ entity, value }) => {
    const [newValue] = value;
    const type = newValue?.value;
    if (type == null) return;

    let name = "Unknown";
    if (StructureTypeNames[type]) name = StructureTypeNames[type];

    setComponent(LocalName, entity, { value: name });
  });

  defineComponentSystem(world, TerrainType, ({ entity, value }) => {
    const [newValue] = value;
    const type = newValue?.value;
    if (type == null) return;

    let name = "Unknown";
    if (TerrainTypeNames[type]) name = TerrainTypeNames[type];

    setComponent(LocalName, entity, { value: name });
  });
}
