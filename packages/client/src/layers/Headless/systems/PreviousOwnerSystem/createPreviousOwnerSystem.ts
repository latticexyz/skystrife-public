import { HeadlessLayer } from "../../types";
import { Entity, defineComponentSystem, hasComponent, setComponent } from "@latticexyz/recs";

export function createPreviousOwnerSystem(layer: HeadlessLayer) {
  const {
    parentLayers: {
      network: {
        components: { OwnedBy },
      },
    },
    world,
    components: { PreviousOwner },
  } = layer;

  defineComponentSystem(world, OwnedBy, ({ entity, value }) => {
    const [currentVal, previousVal] = value;

    if (!hasComponent(PreviousOwner, entity) && currentVal != undefined) {
      setComponent(PreviousOwner, entity, { value: currentVal.value as Entity });
      return;
    }

    const previousOwner = previousVal?.value;
    if (previousOwner == undefined) return;

    setComponent(PreviousOwner, entity, { value: previousOwner as Entity });
  });
}
