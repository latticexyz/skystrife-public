import { defineSystem, Has, Not, removeComponent, setComponent, UpdateType } from "@latticexyz/recs";
import { LocalLayer } from "../../types";

export function createPotentialPathSystem(layer: LocalLayer) {
  const {
    world,
    components: { Selected, PotentialPath, LocalPosition, Path },
    api: { getPotentialPaths },
  } = layer;

  defineSystem(
    world,
    // Not(Path) makes sure PotentialPaths are not rendered while a unit is moving.
    [Has(Selected), Has(LocalPosition), Not(Path)],
    ({ type, entity }) => {
      if (type === UpdateType.Exit) {
        removeComponent(PotentialPath, entity);
      } else if ([UpdateType.Enter, UpdateType.Update].includes(type)) {
        const potentialPaths = getPotentialPaths(entity);
        if (!potentialPaths) return;

        setComponent(PotentialPath, entity, potentialPaths);
      }
    }
  );
}
