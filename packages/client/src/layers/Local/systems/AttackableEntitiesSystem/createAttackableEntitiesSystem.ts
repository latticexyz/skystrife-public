import {
  defineSystem,
  Entity,
  getComponentValue,
  Has,
  HasValue,
  isComponentUpdate,
  Not,
  NotValue,
  removeComponent,
  runQuery,
  setComponent,
  UpdateType,
} from "@latticexyz/recs";
import { LocalLayer } from "../../types";
import { isUntraversable } from "../../../Network/utils";
import { worldCoordEq } from "../../../../utils/coords";
import { manhattan } from "../../../../utils/distance";

export function createAttackableEntitiesSystem(layer: LocalLayer) {
  const {
    world,
    components: { Selected, AttackableEntities, LocalPosition, PotentialPath },
    parentLayers: {
      headless: {
        components: { OnCooldown, NextPosition },
        api: { getAttackableEntities },
      },
      network: {
        components: { Combat, Untraversable, Range, OwnedBy, RequiresSetup },
        utils: { getOwningPlayer },
      },
    },
  } = layer;

  /**
   * Determine which entities a unit can attack.
   * This takes into account move + attack as well.
   */
  defineSystem(
    world,
    [Has(Selected), Has(LocalPosition), Has(Combat), Not(OnCooldown), Not(RequiresSetup)],
    ({ type, entity, component, value }) => {
      if (type === UpdateType.Update && component.id === OnCooldown.id) return;
      if (type === UpdateType.Exit) {
        removeComponent(AttackableEntities, entity);
        return;
      }

      const [currentVal, previousVal] = value;
      if (component.id === OnCooldown.id && currentVal?.value === previousVal?.value) return;

      const paths = getComponentValue(PotentialPath, entity);
      if (!paths) return;

      const currentPosition = getComponentValue(LocalPosition, entity);
      if (!currentPosition) return;

      const potentialTargetLocations = [];
      for (let i = 0; i < paths.x.length; i++) {
        const target = { x: paths.x[i], y: paths.y[i] };

        const nextPositionAtTarget = [...runQuery([HasValue(NextPosition, target)])].length > 0;
        // make sure the position is not blocked
        if (
          !worldCoordEq(currentPosition, target) &&
          (nextPositionAtTarget || isUntraversable(Untraversable, LocalPosition, target))
        )
          continue;

        potentialTargetLocations.push(target);
      }

      const attackableEntities = new Set<Entity>();

      const owningPlayer = getOwningPlayer(entity);
      const allEnemyUnits = [
        ...runQuery([Has(LocalPosition), Has(Combat), NotValue(OwnedBy, { value: owningPlayer })]),
      ];
      const range = getComponentValue(Range, entity);
      if (!range) return;

      for (const targetLocation of potentialTargetLocations) {
        for (const enemy of allEnemyUnits) {
          const enemyPosition = getComponentValue(LocalPosition, enemy);
          if (!enemyPosition) continue;

          const distance = manhattan(targetLocation, enemyPosition);
          if (distance <= range.max && distance >= range.min) {
            attackableEntities.add(enemy);
          }
        }
      }

      setComponent(AttackableEntities, entity, { value: [...attackableEntities] });
    }
  );

  /**
   * Determine which entities a unit can attack if it cannot move and attack.
   */
  defineSystem(
    world,
    [Has(Selected), Has(LocalPosition), Has(Combat), Has(RequiresSetup), Not(OnCooldown)],
    ({ type, entity }) => {
      if (type === UpdateType.Exit) {
        removeComponent(AttackableEntities, entity);
        return;
      }

      const currentPosition = getComponentValue(LocalPosition, entity);
      if (!currentPosition) return;

      const attackableEntities = getAttackableEntities(entity, currentPosition);
      if (!attackableEntities) return;

      setComponent(AttackableEntities, entity, { value: attackableEntities });
    }
  );

  defineSystem(
    world,
    [Has(Selected), Has(LocalPosition), Has(NextPosition), Has(Combat), Not(OnCooldown), Not(RequiresSetup)],
    (update) => {
      const { type, entity, value } = update;

      if (type === UpdateType.Exit) {
        if (isComponentUpdate(update, NextPosition)) {
          const [, previousValue] = value;
          if (previousValue && !previousValue.userCommittedToPosition) return;
        }

        removeComponent(AttackableEntities, entity);
        return;
      }

      const nextPosition = getComponentValue(NextPosition, entity);
      if (!nextPosition) return;

      if (nextPosition.userCommittedToPosition) {
        const attackableEntities = getAttackableEntities(entity, nextPosition);
        if (!attackableEntities) return;

        setComponent(AttackableEntities, entity, { value: attackableEntities });
      }
    }
  );
}
