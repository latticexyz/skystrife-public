import { Entity } from "@latticexyz/recs";
import { encodeEntity } from "@latticexyz/store-sync/recs";
import { Hex, isHex, size } from "viem";

export function encodeMatchEntity(matchEntity: Entity | Hex, entity: Entity | Hex | string) {
  if (!isHex(matchEntity)) throw new Error("matchEntity is not hex");
  if (!isHex(entity)) throw new Error("entity is not hex");
  if (size(matchEntity) != 32) throw new Error(`Expected 32 bytes matchEntity but got ${size(matchEntity)} bytes`);
  if (size(entity) != 32) throw new Error(`Expected 32 bytes entity but got ${size(entity)} bytes`);
  return encodeEntity({ matchEntity: "bytes32", entity: "bytes32" }, { matchEntity, entity });
}
