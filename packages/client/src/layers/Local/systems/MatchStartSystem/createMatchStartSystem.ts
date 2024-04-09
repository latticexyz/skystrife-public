import { defineRxSystem, getComponentValue, hasComponent, setComponent } from "@latticexyz/recs";
import { LocalLayer } from "../../types";

export function createMatchStartSystem(layer: LocalLayer) {
  const {
    parentLayers: {
      network: {
        network: {
          components: { MatchConfig },
          clock,
          matchEntity,
        },
      },
    },
    components: { MatchStarted },
    world,
  } = layer;

  defineRxSystem(world, clock.time$, (time) => {
    if (!matchEntity) return;

    const startTime = getComponentValue(MatchConfig, matchEntity)?.startTime;
    if (!startTime) return;

    if (time / 1000 >= startTime && !hasComponent(MatchStarted, matchEntity)) {
      setComponent(MatchStarted, matchEntity, { value: true });
    }
  });
}
