import { Entity } from "@latticexyz/recs";
import { matchIdToEntity } from "./matchIdToEntity";
import { Hex, maxInt32 } from "viem";

// mirrors `MatchSystem.createMatch` behavior
// this is temporary while we transition to match IDs in keys
export function createMatchEntity(): Entity & Hex {
  const matchId = Math.floor(Math.random() * Number(maxInt32));
  return matchIdToEntity(matchId);
}
