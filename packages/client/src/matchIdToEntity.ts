import { Entity } from "@latticexyz/recs";
import { Hex, numberToHex, padHex } from "viem";

// mirrors `encodeMatchEntity.sol` behavior
// this is temporary while we transition to match IDs in keys
export function matchIdToEntity(matchId: number): Entity & Hex {
  return padHex(numberToHex(matchId, { size: 4 }), { size: 32, dir: "right" }) as Entity & Hex;
}
