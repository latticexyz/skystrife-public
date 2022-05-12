import {
  defineSystem,
  Entity,
  getComponentValue,
  Has,
  Not,
  removeComponent,
  setComponent,
  UpdateType,
} from "@latticexyz/recs";
import { curry } from "lodash";
import { BFS } from "../../../../utils/pathfinding";
import { LocalLayer } from "../../types";

export function createPotentialPathSystem(layer: LocalLayer) {
  const {
    world,
    components: { Selected, PotentialPath, LocalPosition, Path },
    parentLayers: {
      headless: {
        api: { getMoveSpeed, getMovementDifficulty, isUntraversable },
      },
      network: {
        utils: { getOwningPlayer },
      },
    },
  } = layer;

  defineSystem(
    world,
    // Not(Path) makes sure PotentialPaths are not rendered while a unit is moving.
    [Has(Selected), Has(LocalPosition), Not(Path)],
    ({ type, entity }) => {
      if (type === UpdateType.Exit) {
        removeComponent(PotentialPath, entity);
      } else if ([UpdateType.Enter, UpdateType.Update].includes(type)) {
        const moveSpeed = getMoveSpeed(entity);
        if (!moveSpeed) return;

        const localPosition = getComponentValue(LocalPosition, entity);
        if (!localPosition) return;

        const playerEntity = getOwningPlayer(entity) ?? ("0" as Entity);

        const xArray: number[] = [];
        const yArray: number[] = [];

        const [paths, costs] = BFS(
          localPosition,
          moveSpeed,
          curry(getMovementDifficulty)(LocalPosition),
          curry(isUntraversable)(LocalPosition, playerEntity)
        );

        for (const coord of paths) {
          xArray.push(coord.x);
          yArray.push(coord.y);
        }

        const potentialPaths = {
          x: xArray,
          y: yArray,
          costs: costs,
        };
        setComponent(PotentialPath, entity, potentialPaths);
      }
    }
  );
}
