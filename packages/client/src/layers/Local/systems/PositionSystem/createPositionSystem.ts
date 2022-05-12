import {
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
  getComponentValue,
  getComponentValueStrict,
  Has,
  hasComponent,
  Not,
  removeComponent,
  setComponent,
} from "@latticexyz/recs";
import { LocalLayer } from "../../types";
import { worldCoordEq } from "../../../../utils/coords";
import { coordEq } from "phaserx";
import { last } from "lodash";

/**
 * The Position system handles pathing locally for entities if their network layer Position changed.
 */
export function createPositionSystem(layer: LocalLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { Position, Movable },
        utils: { getOwningPlayer },
        network: { matchEntity },
      },
      headless: {
        api: { calculateMovementPath, getMoveSpeed },
        components: { NextPosition, InCurrentMatch },
      },
    },
    components: { LocalPosition, Path },
  } = layer;

  if (!matchEntity) return;

  defineEnterSystem(world, [Has(InCurrentMatch), Has(Position)], ({ entity }) => {
    const position = getComponentValueStrict(Position, entity);

    if (!hasComponent(LocalPosition, entity)) {
      setComponent(LocalPosition, entity, { x: position.x, y: position.y });
    }
  });

  // This is a hack to make sure LocalPosition gets cleared
  // when things die outside of Combat/Summoning. The only time this
  // happens right now is when editing an Entity manually in the
  // Component Browser.
  defineExitSystem(world, [Has(Position)], ({ entity }) => {
    removeComponent(NextPosition, entity);

    setTimeout(() => {
      removeComponent(LocalPosition, entity);
    }, 5_000);
  });

  defineUpdateSystem(world, [Has(InCurrentMatch), Has(Position), Not(Movable)], ({ entity }) => {
    const targetPosition = getComponentValue(Position, entity);
    if (!targetPosition) return;

    setComponent(LocalPosition, entity, { x: targetPosition.x, y: targetPosition.y });
  });

  defineUpdateSystem(
    world,
    [Has(InCurrentMatch), Has(Position), Has(Movable), Has(LocalPosition)],
    ({ entity, component, value }) => {
      if (component !== Position) return;
      if (value[0] === value[1]) return; // no need to run this system if the value didn't change

      const moveSpeed = getMoveSpeed(entity);
      if (!moveSpeed) return;

      const targetPosition = getComponentValueStrict(Position, entity);

      const currentPath = getComponentValue(Path, entity);
      if (currentPath) {
        const currentPathTarget = { x: last(currentPath.x) || Infinity, y: last(currentPath.y) || Infinity };

        if (coordEq(currentPathTarget, targetPosition)) return;
      }

      const localPosition = getComponentValueStrict(LocalPosition, entity);
      if (worldCoordEq(targetPosition, localPosition)) return;

      const playerEntity = getOwningPlayer(entity);
      if (playerEntity == null) return;

      const path = calculateMovementPath(LocalPosition, entity, localPosition, targetPosition);

      if (path.length > 0) {
        const x: number[] = [];
        const y: number[] = [];
        for (const coord of path) {
          x.push(coord.x);
          y.push(coord.y);
        }

        setComponent(Path, entity, { x, y });
      } else {
        // If no Path to the target is found, we assume that the
        // Position change occurred outside of normal movement
        // and just set LocalPosition manually.
        setComponent(LocalPosition, entity, { x: targetPosition.x, y: targetPosition.y });
      }
    }
  );
}
