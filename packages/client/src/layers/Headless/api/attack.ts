import { Entity, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../Network";
import { manhattan } from "../../../utils/distance";

export async function attack(context: { network: NetworkLayer }, attacker: Entity, defender: Entity) {
  const { network } = context;
  const {
    utils: { isOwnedByCurrentPlayer },
    network: {
      components: { Position, Range },
    },
    api: { attack: sendAttackTx },
  } = network;

  if (!isOwnedByCurrentPlayer(attacker)) return;

  const attackerEntityID = attacker;
  const defenderEntityID = defender;

  const attackerPosition = getComponentValue(Position, attacker);
  if (!attackerPosition) return;

  const defenderPosition = getComponentValue(Position, defender);
  if (!defenderPosition) return;

  const distanceToTarget = manhattan(attackerPosition, defenderPosition);
  const attackerRange = getComponentValue(Range, attacker);
  if (!attackerRange) return;

  if (distanceToTarget <= attackerRange.max || distanceToTarget >= attackerRange.min) {
    await sendAttackTx(attackerEntityID, defenderEntityID);
  }
}
