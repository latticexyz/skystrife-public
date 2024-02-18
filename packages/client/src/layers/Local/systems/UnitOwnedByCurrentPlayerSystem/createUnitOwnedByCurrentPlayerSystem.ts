import { Has, defineEnterSystem, setComponent } from "@latticexyz/recs";
import { LocalLayer } from "../..";

export function createUnitOwnedByCurrentPlayerSystem(layer: LocalLayer) {
  const {
    world,
    components: { LocalPosition },
    parentLayers: {
      network: {
        components: { UnitType, OwnedBy, OwnedByCurrentPlayer },
        utils: { isOwnedByCurrentPlayer },
      },
    },
  } = layer;

  // on unit creation, check if the unit is owned by the current player
  // this is calculated and cached here to fix performance issues in isOwnedByCurrentPlayer
  defineEnterSystem(world, [Has(UnitType), Has(LocalPosition), Has(OwnedBy)], ({ entity }) => {
    const ownedByCurrentPlayer = isOwnedByCurrentPlayer(entity);
    if (ownedByCurrentPlayer) setComponent(OwnedByCurrentPlayer, entity, { value: ownedByCurrentPlayer });
  });
}
