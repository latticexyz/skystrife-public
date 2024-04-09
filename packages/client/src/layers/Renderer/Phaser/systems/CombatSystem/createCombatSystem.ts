import { Entity, getComponentValue, hasComponent, removeComponent, setComponent } from "@latticexyz/recs";
import { PhaserLayer } from "../..";
import {
  Animations,
  TILE_HEIGHT,
  TILE_WIDTH,
  UnitTypeAnimations,
  UnitTypeAttackAnimations,
  UnitTypeDeathAnimations,
} from "../../phaserConstants";
import { encodeMatchEntity } from "../../../../../encodeMatchEntity";
import { tileCoordToPixelCoord } from "phaserx";
import { RenderDepth } from "../../types";

export function createCombatSystem(layer: PhaserLayer) {
  const {
    parentLayers: {
      network: {
        network: { matchEntity },
        components: { UnitType, StructureType, Combat, GoldOnKill },
        utils: { isOwnedByCurrentPlayer },
      },
      local: {
        components: { LocalHealth, LocalPosition, Capturer, Selected },
        api: {
          getOwnerColor,
          systemDecoders: { onCombat },
        },
      },
      headless: {
        components: { PreviousOwner },
        api: {
          combat: { canRetaliate },
        },
      },
    },
    scenes: {
      Main: { objectPool, phaserScene },
    },
    animations: { triggerBloodSplatter },
    api: { playTintedAnimation, depthFromPosition, clearIncomingDamage },
  } = layer;

  function playGoldOnKillAnimation(position: { x: number; y: number }, gold: number) {
    const pixelPosition = tileCoordToPixelCoord(position, TILE_WIDTH, TILE_HEIGHT);

    const group = phaserScene.add.group();
    const goldTextSprite = phaserScene.add.text(0, 0, `${gold}`, {
      fontFamily: "Arial",
      fontSize: "12px",
      color: "#FFD700",
      stroke: "#000000",
      strokeThickness: 4,
    });

    goldTextSprite.setPosition(pixelPosition.x + 12, pixelPosition.y);
    goldTextSprite.setOrigin(0, 0);
    goldTextSprite.setDepth(depthFromPosition(position, RenderDepth.UI1));
    group.add(goldTextSprite);

    const goldSprite = phaserScene.add.sprite(0, 0, "");
    goldSprite.setPosition(pixelPosition.x - 4, pixelPosition.y);
    goldSprite.setOrigin(0, 0);
    goldSprite.setDepth(depthFromPosition(position, RenderDepth.UI1));
    goldSprite.setScale(0.5);
    goldSprite.play(Animations.Gold);
    group.add(goldSprite);

    phaserScene.tweens.add({
      targets: group.getChildren(),
      y: pixelPosition.y - 32,
      alpha: 0,
      duration: 1500,
      ease: "Cubic.easeOut",
      onComplete: () => {
        group.destroy(true);
      },
    });
  }

  function playAttackAnimation(
    entity: Entity,
    entityOwner: Entity,
    {
      onStart,
      onContact,
      onComplete,
    }: {
      onStart?: (sprite?: Phaser.GameObjects.Sprite) => void;
      onContact?: (sprite?: Phaser.GameObjects.Sprite) => void;
      onComplete?: (sprite?: Phaser.GameObjects.Sprite) => void;
    },
  ) {
    const unitType = getComponentValue(UnitType, entity)?.value;
    if (!unitType) {
      if (onStart) onStart();
      if (onContact) onContact();
      if (onComplete) onComplete();
      return;
    }
    const attackAnimation = UnitTypeAttackAnimations[unitType];

    const idleAnimation = UnitTypeAnimations[unitType];

    const embodiedObject = objectPool.get(entity, "Sprite");
    const ownerColor = getOwnerColor(entityOwner, matchEntity);

    embodiedObject.setComponent({
      id: "attack-animation",
      once: (sprite) => {
        if (!attackAnimation) {
          if (onComplete) onComplete(sprite);
          return;
        }

        const tintedAnimation = playTintedAnimation(entity, attackAnimation, ownerColor.name);
        let started = false;
        const onAttackUpdate = (anim: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) => {
          if (anim.key !== tintedAnimation) return;

          if (!started && onStart) {
            onStart(sprite);
            started = true;
          }

          if (frame.progress >= 1) {
            playTintedAnimation(entity, idleAnimation, ownerColor.name);
          }
          if (onContact && frame.nextFrame?.isLast) onContact(sprite);
          if (onComplete && frame.progress >= 1) {
            onComplete(sprite);
            sprite.removeListener("animationupdate", onAttackUpdate);
          }
        };

        sprite.on(`animationupdate`, onAttackUpdate);
      },
    });
  }

  function playDeathAnimation(entity: Entity, entityOwner: Entity, onDeath: () => void) {
    const unitType = getComponentValue(UnitType, entity)?.value;
    if (!unitType) {
      onDeath();
      return;
    }

    const deathAnimation = UnitTypeDeathAnimations[unitType];
    const ownerColor = getOwnerColor(entityOwner);

    const embodiedObject = objectPool.get(entity, "Sprite");
    embodiedObject.setComponent({
      id: "death-animation",
      once: (sprite) => {
        playTintedAnimation(entity, deathAnimation, ownerColor.name);
        sprite.on(`animationcomplete`, () => {
          onDeath();
        });
      },
    });
  }

  onCombat(
    ({
      attacker,
      attackerDied,
      attackerDamageReceived,
      defenderDamageReceived,
      defender,
      defenderDied,
      ranged,
      defenderCaptured,
    }) => {
      if (!matchEntity) return;

      if (attackerDied && hasComponent(Selected, attacker)) removeComponent(Selected, attacker);
      if (defenderDied && hasComponent(Selected, defender)) removeComponent(Selected, defender);

      const attackerPosition = getComponentValue(LocalPosition, attacker);
      if (!attackerPosition) return;

      const defenderPosition = getComponentValue(LocalPosition, defender);
      if (!defenderPosition) return;

      const attackerPreviousOwner = getComponentValue(PreviousOwner, attacker);
      const defenderPreviousOwner = getComponentValue(PreviousOwner, defender);

      const attackerOwner = attackerPreviousOwner
        ? encodeMatchEntity(matchEntity, attackerPreviousOwner.value)
        : ("0" as Entity);
      const defenderOwner = defenderPreviousOwner
        ? encodeMatchEntity(matchEntity, defenderPreviousOwner.value)
        : ("0" as Entity);

      const defenderIsStructure = getComponentValue(StructureType, defender);
      const flipAttacker = defenderPosition.x < attackerPosition.x;
      const flipDefender = attackerPosition.x < defenderPosition.x;

      const attackerTookDamage = attackerDamageReceived > 0;
      const defenderTookDamage = defenderDamageReceived > 0;

      const attackerHealth = getComponentValue(Combat, attacker)?.health || 0;
      const defenderHealth = getComponentValue(Combat, defender)?.health || 0;

      playAttackAnimation(attacker, attackerOwner, {
        onStart: (sprite) => {
          if (sprite) sprite.flipX = flipAttacker;
        },
        onContact: () => {
          clearIncomingDamage(attacker, defender);
          clearIncomingDamage(defender, attacker);

          if (attackerDied) {
            setComponent(LocalHealth, attacker, { value: 0 });
          } else if (attackerTookDamage) {
            setComponent(LocalHealth, attacker, { value: attackerHealth });
          }

          if (attackerDied || attackerTookDamage) {
            triggerBloodSplatter(attackerPosition);
          }

          if (defenderDied) {
            setComponent(LocalHealth, defender, { value: 0 });
          } else if (defenderTookDamage) {
            setComponent(LocalHealth, defender, { value: defenderHealth });
          }

          if (defenderDied || defenderTookDamage) {
            if (!defenderIsStructure) {
              triggerBloodSplatter(defenderPosition);
            }
          }

          if (defenderCaptured) {
            setComponent(Capturer, defender, { value: attacker });
          }
        },
        onComplete: (sprite) => {
          if (sprite && flipAttacker) sprite.flipX = false;

          if (attackerDied) {
            playDeathAnimation(attacker, attackerOwner, () => {
              removeComponent(LocalHealth, attacker);
              removeComponent(LocalPosition, attacker);
            });
          }

          if (defenderDied) {
            playDeathAnimation(defender, defenderOwner, () => {
              removeComponent(LocalHealth, defender);
              removeComponent(LocalPosition, defender);
            });

            const goldOnKill = getComponentValue(GoldOnKill, defender)?.value;
            if (isOwnedByCurrentPlayer(attacker) && goldOnKill) {
              playGoldOnKillAnimation(defenderPosition, goldOnKill);
            }
          }
        },
      });
      if (!ranged && canRetaliate(layer.parentLayers.network, defender))
        playAttackAnimation(defender, defenderOwner, {
          onStart: (sprite) => {
            if (sprite) sprite.flipX = flipDefender;
          },
          onComplete: (sprite) => {
            if (sprite && flipDefender) sprite.flipX = false;
          },
        });
    },
  );
}
