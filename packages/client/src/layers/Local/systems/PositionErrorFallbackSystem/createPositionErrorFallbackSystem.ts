import { Entity, getComponentValueStrict, Has, Not, runQuery, setComponent } from "@latticexyz/recs";
import { LocalLayer } from "../..";

/**
 * If everything was perfect this system would not be needed.
 * Alas, we live in an imperfect world.
 * This system is a fallback for when, for some reason, we do not properly apply
 * Position updates to an entity in the client.
 * @param layer
 */
export function createPositionErrorFallbackSystem(layer: LocalLayer) {
  const {
    components: { LocalPosition, Path },
    parentLayers: {
      network: {
        components: { Position, UnitType },
      },
    },
  } = layer;

  function correctClientPosition(entity: Entity, commit = false) {
    const localPosition = getComponentValueStrict(LocalPosition, entity);
    const position = getComponentValueStrict(Position, entity);

    if (localPosition.x !== position.x || localPosition.y !== position.y) {
      console.warn(`Position error detected for entity ${entity}. Correcting...`);
      if (commit) {
        setComponent(LocalPosition, entity, { x: position.x, y: position.y });
      } else {
        setTimeout(() => correctClientPosition(entity, true), 1000);
      }
    }
  }

  setInterval(() => {
    for (const entity of runQuery([Has(UnitType), Has(LocalPosition), Has(Position), Not(Path)])) {
      correctClientPosition(entity);
    }
  }, 5_000);
}
