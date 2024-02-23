import {
  Has,
  getComponentValueStrict,
  defineSystem,
  setComponent,
  UpdateType,
  removeComponent,
  isComponentUpdate,
  hasComponent,
} from "@latticexyz/recs";
import { PhaserLayer } from "../../types";
import {
  UnitTypeSprites,
  StructureTypeSprites,
  StructureTypeAnimations,
  UnitTypeAnimations,
  Animations,
} from "../../phaserConstants";

/**
 * The Sync system handles adding Phaser layer components to entites based on components they have on parent layers
 */
export function createSetVisualsSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { UnitType, StructureType },
      },
      local: {
        components: { LocalPosition, Path },
      },
    },
    components: { Appearance, SpriteAnimation },
    api: { playAnimationWithOwnerColor },
  } = layer;

  defineSystem(world, [Has(UnitType), Has(LocalPosition)], ({ entity, type }) => {
    const entityType = getComponentValueStrict(UnitType, entity).value;

    if (type === UpdateType.Exit) removeComponent(Appearance, entity);

    setComponent(Appearance, entity, {
      value: UnitTypeSprites[entityType],
    });
  });

  defineSystem(world, [Has(StructureType), Has(LocalPosition)], ({ entity, type }) => {
    const entityType = getComponentValueStrict(StructureType, entity).value;

    if (type === UpdateType.Exit) removeComponent(Appearance, entity);

    setComponent(Appearance, entity, {
      value: StructureTypeSprites[entityType],
    });
  });

  defineSystem(world, [Has(StructureType), Has(LocalPosition)], ({ entity, type }) => {
    if (type === UpdateType.Exit) removeComponent(SpriteAnimation, entity);

    const entityType = getComponentValueStrict(StructureType, entity).value;
    const animation = StructureTypeAnimations[entityType];
    if (!animation) return;

    setComponent(SpriteAnimation, entity, {
      value: StructureTypeAnimations[entityType],
    });
  });

  defineSystem(world, [Has(UnitType), Has(LocalPosition)], ({ entity, type }) => {
    if (type === UpdateType.Exit) removeComponent(SpriteAnimation, entity);
    if (type !== UpdateType.Enter) return;

    const entityType = getComponentValueStrict(UnitType, entity).value;
    const animation = UnitTypeAnimations[entityType];
    if (!animation) return;

    setComponent(SpriteAnimation, entity, {
      value: UnitTypeAnimations[entityType],
    });
  });

  defineSystem(world, [Has(SpriteAnimation), Has(LocalPosition), Has(Path)], (update) => {
    const { entity, type } = update;

    if (isComponentUpdate(update, Path) && type === UpdateType.Exit && hasComponent(SpriteAnimation, entity)) {
      const animation = getComponentValueStrict(SpriteAnimation, entity).value;
      playAnimationWithOwnerColor(entity, animation as Animations);
    }
  });
}
