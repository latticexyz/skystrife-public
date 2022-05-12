import { Coord } from "phaserx";
import { Component, Entity, getComponentValue, Type } from "@latticexyz/recs";
import { WorldCoord } from "../types";

/**
 * @param a Coordinate A
 * @param b Coordinate B
 * @returns Manhattan distance from A to B (https://xlinux.nist.gov/dads/HTML/manhattanDistance.html)
 */
export function manhattan(a: WorldCoord, b: WorldCoord) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export const getNeighboringPositions = (coord: Coord) => {
  return [
    { ...coord, x: coord.x + 1 },
    { ...coord, x: coord.x - 1 },
    { ...coord, y: coord.y + 1 },
    { ...coord, y: coord.y - 1 },
  ];
};

export const getPositionsWithinRange = (coord: Coord, minRange: number, maxRange: number) => {
  const positions: Coord[] = [];

  for (let x = coord.x - maxRange; x <= coord.x + maxRange; x++) {
    for (let y = coord.y - maxRange; y <= coord.y + maxRange; y++) {
      const distance = manhattan(coord, { x, y });
      if (distance >= minRange && distance <= maxRange) {
        positions.push({ x, y });
      }
    }
  }

  return positions;
};

export const getClosestTraversablePositionToTarget = (
  positionComponent: Component<{ x: Type.Number; y: Type.Number }>,
  canMoveTo: (entity: Entity, pos: Coord) => boolean,
  entity: Entity,
  target: Entity,
  minRange = 1,
  maxRange = 1
) => {
  const attackerPosition = getComponentValue(positionComponent, entity);
  if (!attackerPosition) return;

  const defenderPosition = getComponentValue(positionComponent, target);
  if (!defenderPosition) return;

  const potentialPositions = getPositionsWithinRange(defenderPosition, minRange, maxRange);

  let closestUnblockedPosition: Coord | undefined;
  for (const pos of potentialPositions) {
    if (!canMoveTo(entity, pos)) continue;

    const previousDistance = closestUnblockedPosition
      ? manhattan(attackerPosition, closestUnblockedPosition)
      : Infinity;
    const distance = manhattan(attackerPosition, pos);

    if (distance < previousDistance) closestUnblockedPosition = pos;
  }

  return closestUnblockedPosition;
};
