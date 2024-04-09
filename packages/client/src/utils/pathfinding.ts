import { WorldCoord } from "../types";
import { worldCoordEq } from "./coords";
import { manhattan } from "./distance";
import { CoordMap } from "@latticexyz/utils";
import { Heap } from "heap-js";

export function coordEq(a?: WorldCoord, b?: WorldCoord) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.x === b.x && a.y === b.y;
}

interface GridNode {
  x: number;
  y: number;
  f: number;
  g: number;
  h: number;
  cost: number;
  visited: boolean;
  closed: boolean;
  parent: GridNode | null;
}
interface BFSNode {
  f: number;
  cost: number;
  visited: boolean;
}

function getVisitableNeighbor(currentPosition: WorldCoord, isUntraversable: (position: WorldCoord) => boolean) {
  const neighbors = [
    { x: currentPosition.x, y: currentPosition.y - 1 }, // Up
    { x: currentPosition.x + 1, y: currentPosition.y }, // Right
    { x: currentPosition.x, y: currentPosition.y + 1 }, // Down
    { x: currentPosition.x - 1, y: currentPosition.y }, // Left
  ];
  const visitableNeighbors: WorldCoord[] = [];
  for (const neighbor of neighbors) {
    if (!isUntraversable(neighbor)) {
      visitableNeighbors.push(neighbor);
    }
  }
  return visitableNeighbors;
}

/**
 * @param from Coordinate to start from (included in the path)
 * @param to Coordinate to go to (included in the path)
 * @param maxDistance The maximum distance that can be traveled in the path
 * @param getMovementDifficulty A function that takes in a coordinate and returns the movement speed cost of traversing it
 * @param isUntraversable A function that takes in a coordinate and returns true if it cannot be traversed
 * @returns Finds shortest path between the from and to coordinates
 */
export function aStar(
  from: WorldCoord,
  to: WorldCoord,
  maxDistance: number,
  getMovementDifficulty: (targetPosition: WorldCoord) => number,
  isUntraversable: (isFinalPosition: boolean, position: WorldCoord) => boolean,
): WorldCoord[] {
  const distanceTraveling = manhattan(from, to);
  if (distanceTraveling > maxDistance) return [];

  const path: WorldCoord[] = [];
  const nodeMap = new CoordMap<GridNode>();

  const start = {
    x: from.x,
    y: from.y,
    f: 0,
    g: 0,
    h: 0,
    cost: 0,
    visited: false,
    closed: false,
    parent: null,
  };

  nodeMap.set(from, start);

  const customPriorityComparator = (a: GridNode, b: GridNode) => a.f - b.f;
  const openHeap = new Heap(customPriorityComparator);

  openHeap.push(start);

  while (openHeap.size() > 0) {
    const currentNode = openHeap.pop()!;

    if (worldCoordEq(currentNode, to)) {
      let curr = currentNode;
      while (curr && curr.parent) {
        path.push({ x: curr.x, y: curr.y });
        curr = curr.parent;
      }
      return path.reverse();
    }

    currentNode.closed = true;

    const neighborCoords = getVisitableNeighbor(currentNode, (position: WorldCoord) =>
      isUntraversable(coordEq(position, to), position),
    );

    for (let i = 0; i < neighborCoords.length; i++) {
      let neighbor = nodeMap.get(neighborCoords[i]);
      if (!neighbor) {
        const neighboordCoord = neighborCoords[i];

        neighbor = {
          ...neighboordCoord,
          f: 0,
          g: 0,
          h: 0,
          cost: getMovementDifficulty(neighboordCoord),
          visited: false,
          closed: false,
          parent: null,
        };
        nodeMap.set(neighboordCoord, neighbor);
      }
      if (neighbor.closed) {
        continue;
      }

      const gScore = currentNode.g + neighbor.cost;
      const beenVisited = neighbor.visited;

      if (gScore <= maxDistance && (!beenVisited || gScore < neighbor.g)) {
        neighbor.visited = true;
        neighbor.parent = currentNode;
        neighbor.h = neighbor.h || manhattan({ x: neighbor.x, y: neighbor.y }, to);
        neighbor.g = gScore;
        neighbor.f = neighbor.g + neighbor.h;

        if (!beenVisited) {
          openHeap.push(neighbor);
        }
      }
    }
  }

  return [];
}

/**
 * @param from Coordinate to start from (included in the path)
 * @param maxDistance The maximum distance that can be traveled
 * @param isUntraversable A function that takes in a coordinate and returns true if it cannot be traversed
 * @returns Finds all coords you can reach with maxDistance
 */
export function BFS(
  from: WorldCoord,
  maxDistance: number,
  getMovementDifficulty: (targetPosition: WorldCoord) => number,
  isUntraversable: (isFinalPosition: boolean, position: WorldCoord) => boolean,
): [WorldCoord[], number[]] {
  const path: WorldCoord[] = [];
  const costs: number[] = [];
  const nodeMap = new CoordMap<BFSNode>();

  const unvisitedCoords: WorldCoord[] = [];
  const start = {
    f: 0,
    cost: 1,
    visited: true,
  };
  nodeMap.set(from, start);
  unvisitedCoords.push(from);

  while (unvisitedCoords.length > 0) {
    const currentCoord = unvisitedCoords.shift()!;
    const currentNode = nodeMap.get(currentCoord)!;

    const neighborCoords = getVisitableNeighbor(currentCoord, function (position: WorldCoord) {
      return isUntraversable(currentNode.f === maxDistance - 1, position);
    });

    for (let i = 0; i < neighborCoords.length; i++) {
      let neighbor = nodeMap.get(neighborCoords[i]);
      if (!neighbor) {
        neighbor = {
          f: 0,
          cost: getMovementDifficulty(neighborCoords[i]),
          visited: false,
        };
        nodeMap.set(neighborCoords[i], neighbor);
      } else {
        const cost = getMovementDifficulty(neighborCoords[i]);
        if (neighbor.cost > cost) neighbor.cost = cost;
      }

      const totalCost = currentNode.f + neighbor.cost;
      const beenVisited = neighbor.visited;

      if (totalCost <= maxDistance) {
        if (!beenVisited) {
          unvisitedCoords.push(neighborCoords[i]);
          path.push(neighborCoords[i]);
          costs.push(totalCost);
          neighbor.visited = true;
          neighbor.f = totalCost;
        } else {
          if (totalCost < neighbor.f) {
            neighbor.f = totalCost;
            unvisitedCoords.push(neighborCoords[i]);
            const index = path.findIndex((coord) => neighborCoords[i].x == coord.x && neighborCoords[i].y == coord.y);
            costs[index] = totalCost;
          }
        }
      }
    }
  }

  return [path, costs];
}

/**
 * @param from Coordinate to start from (included in the path)
 * @param to Coordinate to go to (included in the path)
 * @returns Finds a path between the from and to coordinates, used in some cases when aStar fails
 */
export function directionalPathfind(from: WorldCoord, to: WorldCoord): WorldCoord[] {
  const path: WorldCoord[] = [];
  const directionX = from.x < to.x ? 1 : -1;
  const directionY = from.y < to.y ? 1 : -1;

  for (let x = from.x + directionX; directionX * x <= directionX * to.x; x = x + directionX) {
    path.push({ x, y: from.y });
  }

  for (let y = from.y + directionY; directionY * y <= directionY * to.y; y = y + directionY) {
    path.push({ x: to.x, y });
  }

  return path;
}
