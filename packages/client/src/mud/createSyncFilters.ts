import { resourceToHex } from "@latticexyz/common";
import { Entity } from "@latticexyz/recs";
import { SyncFilter } from "@latticexyz/store-sync";
import mudConfig from "contracts/mud.config";
import { Hex } from "viem";

const MATCH_SPECIFIC_TABLES_NEEDED_IN_AMALGEMA = ["Player", "SpawnReservedBy", "OwnedBy", "LevelContent"];

const tables = Object.values(mudConfig.tables).map((table) => {
  const tableId = resourceToHex({
    type: table.offchainOnly ? "offchainTable" : "table",
    // TODO: update once this multiple namespaces is supported (https://github.com/latticexyz/mud/issues/994)
    namespace: mudConfig.namespace,
    name: table.name,
  });
  return { ...table, tableId };
});

const matchSpecificTables = tables.filter((table) => {
  const keyNames = Object.keys(table.keySchema);
  return keyNames[0] === "matchEntity" && keyNames[1] === "entity";
});
const nonMatchSpecificTables = tables.filter((table) => {
  return !matchSpecificTables.includes(table) || MATCH_SPECIFIC_TABLES_NEEDED_IN_AMALGEMA.includes(table.name);
});
const nonMatchSpecificFilters: SyncFilter[] = nonMatchSpecificTables.map((table) => ({ tableId: table.tableId }));

export function createSyncFilters(matchEntity: Entity | null): SyncFilter[] {
  if (matchEntity == null) return nonMatchSpecificFilters;
  return [
    ...nonMatchSpecificFilters,
    ...matchSpecificTables.map((table) => ({
      tableId: table.tableId,
      key0: matchEntity as Hex,
    })),
  ];
}
