import {
  defineSystem,
  Entity,
  getComponentValue,
  getComponentValueStrict,
  Has,
  hasComponent,
  Not,
  UpdateType,
} from "@latticexyz/recs";
import { PhaserLayer } from "../..";
import { StructureTypes } from "../../../../Network";

export function createTintNoStaminaSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { UnitType, StructureType },
      },
      headless: {
        components: { OnCooldown, Depleted },
      },
      local: {
        components: { LocalPosition },
      },
    },
    scenes: {
      Main: { objectPool },
    },
  } = layer;

  const tintStamina = (entity: Entity) => {
    const spriteObj = objectPool.get(entity, "Sprite");
    spriteObj.setComponent({
      id: "stamina-tint",
      once: (sprite) => {
        if (hasComponent(OnCooldown, entity) || hasComponent(Depleted, entity)) {
          sprite.setTint(0x808080);
        } else {
          sprite.clearTint();
        }
      },
    });
  };

  defineSystem(world, [Has(UnitType), Has(OnCooldown), Has(LocalPosition)], ({ entity, type }) => {
    if (type === UpdateType.Exit && !getComponentValue(LocalPosition, entity)) return;

    tintStamina(entity);
  });

  defineSystem(world, [Has(UnitType), Not(OnCooldown), Has(LocalPosition)], ({ entity, type }) => {
    if (type === UpdateType.Exit && !getComponentValue(LocalPosition, entity)) return;

    tintStamina(entity);
  });

  defineSystem(world, [Has(Depleted), Has(LocalPosition), Has(StructureType)], ({ entity, type }) => {
    if (type === UpdateType.Exit) return;
    if (getComponentValueStrict(StructureType, entity).value === StructureTypes.SpawnSettlement) return;

    tintStamina(entity);
  });
}
