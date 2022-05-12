import {
  defineRxSystem,
  defineSystem,
  Entity,
  getComponentValueStrict,
  Has,
  removeComponent,
  runQuery,
  setComponent,
} from "@latticexyz/recs";
import { HeadlessLayer } from "../../types";

export function createCooldownSystem(layer: HeadlessLayer) {
  const {
    world,
    components: { OnCooldown, InCurrentMatch },
    parentLayers: {
      network: {
        network: {
          components: { LastAction },
          clock,
        },
        utils: { getTurnAtTimeForCurrentMatch },
      },
    },
  } = layer;

  const setCooldown = (atTime: number, entity: Entity) => {
    const lastAction = getComponentValueStrict(LastAction, entity);
    const lastActionTime = lastAction.value;

    if (getTurnAtTimeForCurrentMatch(atTime) <= getTurnAtTimeForCurrentMatch(Number(lastActionTime))) {
      setComponent(OnCooldown, entity, { value: true });
    } else {
      removeComponent(OnCooldown, entity);
    }
  };

  defineRxSystem(world, clock.time$, (time) => {
    const currentTime = time / 1000;
    for (const entity of runQuery([Has(LastAction), Has(InCurrentMatch)])) {
      setCooldown(currentTime, entity);
    }
  });

  defineSystem(world, [Has(LastAction), Has(InCurrentMatch)], ({ entity }) => {
    setCooldown(clock.currentTime / 1000, entity);
  });
}
