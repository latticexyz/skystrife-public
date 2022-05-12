import { getComponentValue, setComponent, defineComponentSystem, removeComponent } from "@latticexyz/recs";
import { last } from "lodash";
import { concatMap, delay, find, from, of, zipWith } from "rxjs";
import { FAST_MOVE_SPEED } from "../../constants";
import { LocalLayer } from "../../types";

/**
 * The Path system handles moving entities along the path defined in their Path component.
 */
export function createPathSystem(layer: LocalLayer) {
  const {
    world,
    components: { Path, LocalPosition },
  } = layer;

  defineComponentSystem(world, Path, (update) => {
    const path = update.value[0];
    if (!path) return;

    const firstPathPosition = {
      x: path.x[0],
      y: path.y[0],
    };

    const positionStream = from(path.x).pipe(
      zipWith(from(path.y)), // Transform coords into format [x,y]
      concatMap((position) => {
        const speed = position[0] === firstPathPosition.x && position[1] === firstPathPosition.y ? 0 : FAST_MOVE_SPEED;
        return of(position).pipe(delay(speed));
      })
    );

    const finalPosition = {
      x: last(path.x),
      y: last(path.y),
    };

    const moveSubscription = positionStream.subscribe({
      next: ([x, y]) => {
        // If there is no LocalPosition, it was removed by another system for a reason and we should stop pathing
        const currentLocalPosition = getComponentValue(LocalPosition, update.entity);
        if (!currentLocalPosition) {
          moveSubscription.unsubscribe();
          return;
        }

        setComponent(LocalPosition, update.entity, { x, y });

        if (x === finalPosition.x && y === finalPosition.y) {
          setTimeout(() => {
            removeComponent(Path, update.entity);
          }, FAST_MOVE_SPEED);
        }
      },
    });

    // Stop previous traversal if there is a new path
    const updateSubscription = Path.update$
      .pipe(find((newValue) => newValue.entity === update.entity))
      .subscribe(() => {
        moveSubscription?.unsubscribe();
      });

    world.registerDisposer(() => {
      moveSubscription?.unsubscribe();
      updateSubscription?.unsubscribe();
    });
  });
}
