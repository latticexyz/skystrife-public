import { readHex } from "@latticexyz/common";
import { Entity } from "@latticexyz/recs";
import { hexToNumber, isHex } from "viem";

// mirrors `decodeMatchEntity.sol` behavior
// this is temporary while we transition to match IDs in keys
export function matchIdFromEntity(matchEntity: Entity): number {
  if (!isHex(matchEntity)) throw new Error("match entity is not hex");
  return hexToNumber(readHex(matchEntity, 0, 4));
}
