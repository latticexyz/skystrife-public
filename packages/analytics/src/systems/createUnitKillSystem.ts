import {
  Entity,
  Has,
  defineSystem,
  getComponentValue,
  getComponentValueStrict,
  hasComponent,
  setComponent,
} from "@latticexyz/recs";
import { AnalyticsLayer } from "../types";
import { uuid } from "@latticexyz/utils";

export function createUnitKillSystem(layer: AnalyticsLayer) {
  const {
    world,
    networkLayer: {
      components: { CombatResult, Match, Position, UnitType, StructureType },
    },
    clock,
    utils: { getCurrentBlockNumber, storePlayerTotalUnitSnapshot, storePlayerTotalStructureSnapshot, getTurnAtTime },
    components: { UnitKill, UnitDeath, StructureCapture, StructureKill, PreviousOwner },
  } = layer;

  defineSystem(world, [Has(CombatResult)], ({ entity }) => {
    const combatResult = getComponentValueStrict(CombatResult, entity);
    const { attacker: _attacker, defender: _defender, attackerDied, defenderDied, defenderCaptured } = combatResult;

    const attacker = _attacker as Entity;
    const defender = _defender as Entity;

    const defenderIsStructure = hasComponent(StructureType, defender);

    const attackerPlayer = getComponentValue(PreviousOwner, attacker)?.value;
    const defenderPlayer = getComponentValue(PreviousOwner, defender)?.value;
    if (!attackerPlayer || !defenderPlayer) return;

    const matchEntity = getComponentValue(Match, attackerPlayer)?.matchEntity as Entity | undefined;
    if (!matchEntity) return;

    const createdAtBlock = getCurrentBlockNumber();
    const attackerPosition = getComponentValue(Position, attacker) ?? { x: 0, y: 0 };
    const defenderPosition = getComponentValue(Position, defender) ?? { x: 0, y: 0 };

    const turn = getTurnAtTime(matchEntity, clock.currentTime / 1000);

    if (defenderDied && !defenderIsStructure) {
      const eventEntity = uuid() as Entity;

      setComponent(UnitKill, eventEntity, {
        turn,
        createdAtBlock,
        matchEntity,
        killerPlayer: attackerPlayer,
        victimPlayer: defenderPlayer,
        killerUnitType: getComponentValueStrict(UnitType, attacker).value,
        victimUnitType: getComponentValueStrict(UnitType, defender).value,
        x: attackerPosition.x,
        y: attackerPosition.y,
      });
      setComponent(UnitDeath, eventEntity, {
        turn,
        createdAtBlock,
        matchEntity,
        killerPlayer: attackerPlayer,
        victimPlayer: defenderPlayer,
        killerUnitType: getComponentValueStrict(UnitType, attacker).value,
        victimUnitType: getComponentValueStrict(UnitType, defender).value,
        x: defenderPosition.x,
        y: defenderPosition.y,
      });

      storePlayerTotalUnitSnapshot(defenderPlayer);
    }

    if (attackerDied) {
      const eventEntity = uuid() as Entity;
      setComponent(UnitKill, eventEntity, {
        turn,
        createdAtBlock,
        matchEntity,
        killerPlayer: defenderPlayer,
        victimPlayer: attackerPlayer,
        killerUnitType: getComponentValue(UnitType, defender)?.value ?? 0,
        victimUnitType: getComponentValueStrict(UnitType, attacker).value,
        x: defenderPosition.x,
        y: defenderPosition.y,
      });
      setComponent(UnitDeath, eventEntity, {
        turn,
        createdAtBlock,
        matchEntity,
        killerPlayer: defenderPlayer,
        victimPlayer: attackerPlayer,
        killerUnitType: getComponentValue(UnitType, defender)?.value ?? 0,
        victimUnitType: getComponentValueStrict(UnitType, attacker).value,
        x: attackerPosition.x,
        y: attackerPosition.y,
      });

      storePlayerTotalUnitSnapshot(attackerPlayer);
    }

    if (defenderCaptured && defenderIsStructure) {
      const eventEntity = uuid() as Entity;
      setComponent(StructureCapture, eventEntity, {
        turn,
        createdAtBlock,
        matchEntity,
        player: attackerPlayer,
        capturerUnitType: getComponentValueStrict(UnitType, attacker).value,
        previousOwnerPlayer: defenderPlayer,
        structureType: getComponentValueStrict(StructureType, defender).value,
        x: defenderPosition.x,
        y: defenderPosition.y,
      });

      storePlayerTotalStructureSnapshot(defenderPlayer);
    }

    if (defenderDied && defenderIsStructure) {
      const eventEntity = uuid() as Entity;
      setComponent(StructureKill, eventEntity, {
        turn,
        createdAtBlock,
        matchEntity,
        killerPlayer: attackerPlayer,
        victimPlayer: defenderPlayer,
        killerUnitType: getComponentValueStrict(UnitType, attacker).value,
        victimStructureType: getComponentValueStrict(StructureType, defender).value,
        x: attackerPosition.x,
        y: attackerPosition.y,
      });

      storePlayerTotalStructureSnapshot(defenderPlayer);
    }
  });
}
