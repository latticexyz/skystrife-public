import {
  defineSystem,
  Entity,
  getComponentValue,
  getComponentValueStrict,
  Has,
  hasComponent,
  Not,
  setComponent,
  UpdateType,
} from "@latticexyz/recs";
import { PhaserLayer } from "../..";
import { StructureTypes } from "../../../../Network";

export function createTintOnCooldownSystem(layer: PhaserLayer) {
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
    globalObjectPool,
    components: { SpriteAnimation },
  } = layer;

  const tintCooldown = (entity: Entity) => {
    const sprite = globalObjectPool.get(entity, "Sprite");
    if (hasComponent(OnCooldown, entity) || hasComponent(Depleted, entity)) {
      sprite.setTint(0x808080);
    } else {
      sprite.clearTint();
    }
  };

  defineSystem(world, [Has(UnitType), Has(OnCooldown), Has(LocalPosition)], ({ entity, type }) => {
    if (type === UpdateType.Exit && !getComponentValue(LocalPosition, entity)) return;

    tintCooldown(entity);
  });

  defineSystem(world, [Has(UnitType), Not(OnCooldown), Has(LocalPosition)], ({ entity, type }) => {
    if (type === UpdateType.Exit && !getComponentValue(LocalPosition, entity)) return;

    tintCooldown(entity);
  });

  // Only Gold Mines right now
  defineSystem(world, [Has(Depleted), Has(LocalPosition), Has(StructureType)], ({ entity, type }) => {
    if (type === UpdateType.Exit) return;
    if (getComponentValueStrict(StructureType, entity).value === StructureTypes.SpawnSettlement) return;
    if (getComponentValueStrict(StructureType, entity).value === StructureTypes.Settlement) return;

    tintCooldown(entity);
    const sprite = globalObjectPool.get(entity, "Sprite");
    sprite.stop();
  });

  const restartIdleAnim = (entity: Entity) => {
    const sprite = globalObjectPool.get(entity, "Sprite");
    const currentAnim = sprite.anims.currentAnim;

    if (!currentAnim) return;
    if (!currentAnim.key.includes("Idle")) return;

    sprite.off("animationstart");
    const spriteAnimation = getComponentValue(SpriteAnimation, entity);
    if (spriteAnimation) setComponent(SpriteAnimation, entity, spriteAnimation);
  };

  defineSystem(world, [Has(UnitType), Has(SpriteAnimation), Has(OnCooldown)], ({ entity, type, component }) => {
    const sprite = globalObjectPool.get(entity, "Sprite");

    if (component.id === OnCooldown.id && type === UpdateType.Exit) {
      restartIdleAnim(entity);
      return;
    }

    sprite.on("animationstart", (anim: Phaser.Animations.Animation) => {
      if (anim.key.includes("Idle")) {
        sprite.stop();
      }
    });
  });
}
