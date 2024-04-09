import {
  defineSystem,
  getComponentValue,
  Has,
  isComponentUpdate,
  Not,
  removeComponent,
  setComponent,
  UpdateType,
} from "@latticexyz/recs";
import { LocalLayer } from "../../types";

export function createAttackableEntitiesSystem(layer: LocalLayer) {
  const {
    world,
    components: { Selected, AttackableEntities, LocalPosition },
    parentLayers: {
      headless: {
        components: { OnCooldown, NextPosition },
        api: { getAttackableEntities },
      },
      network: {
        components: { Combat, RequiresSetup },
      },
    },
    api: { getAllAttackableEntities },
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

      const allAttackableEntities = getAllAttackableEntities(entity);
      if (!allAttackableEntities) return;

      setComponent(AttackableEntities, entity, { value: [...allAttackableEntities] });
    },
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
    },
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
    },
  );
}
