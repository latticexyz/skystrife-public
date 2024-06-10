import { resourceToHex } from "@latticexyz/common";
import { Entity } from "@latticexyz/recs";
import { SyncFilter } from "@latticexyz/store-sync";
import mudConfig from "contracts/mud.config";
import { Hex } from "viem";

/**
 * These tables can be scoped to a specific Match when loading a match,
 * but also we need all of them to be loaded in Amalgema.
 */
const MATCH_TABLES_NEEDED_EVERYWHERE = [
  "MatchConfig",
  "MatchSky",
  "MatchName",
  "MatchSpawnPoints",
  "MatchPlayers",
  "MatchEntityCounter",
  "MatchAccessControl",
  "MatchFinished",
  "MatchMapCopyProgress",
  "MatchReady",
  "MatchRanking",
  "MatchSweepstake",
  "MatchReward",
  "SpawnReservedBy",
  "CreatedByAddress",
  "MatchPlayer",
  "Player",
  "MatchAllowed",
  "MatchIndex",
  "Player",
];

const MATCH_SPECIFIC_TABLES_NEEDED_IN_AMALGEMA = ["LevelContent"];

const EXTRA_MATCH_SPECIFIC_TABLES = ["EntitiesAtPosition", "Match", "Chargers"];

const tables = Object.values(mudConfig.tables).map((table) => {
  const tableId = resourceToHex({
    type: table.type,
    // TODO: update once this multiple namespaces is supported (https://github.com/latticexyz/mud/issues/994)
    namespace: mudConfig.namespace,
    name: table.name,
  });
  return { ...table, tableId };
});

const matchSpecificTables = tables.filter((table) => {
  if (EXTRA_MATCH_SPECIFIC_TABLES.includes(table.name) || MATCH_TABLES_NEEDED_EVERYWHERE.includes(table.name))
    return true;

  const keyNames = table.key;
  return keyNames[0] === "matchEntity" && keyNames[1] === "entity";
});
const nonMatchSpecificTables = tables.filter((table) => {
  return !matchSpecificTables.includes(table) || MATCH_SPECIFIC_TABLES_NEEDED_IN_AMALGEMA.includes(table.name);
});
const nonMatchSpecificFilters: SyncFilter[] = nonMatchSpecificTables.map((table) => ({ tableId: table.tableId }));

const amalgemaTableFilters = nonMatchSpecificFilters.concat(
  tables.filter((t) => MATCH_TABLES_NEEDED_EVERYWHERE.includes(t.name)).map((table) => ({ tableId: table.tableId })),
);

export function createSyncFilters(matchEntity: Entity | null): SyncFilter[] {
  if (matchEntity == null) return amalgemaTableFilters;
  const filters = [
    ...nonMatchSpecificFilters,
    ...matchSpecificTables.map((table) => ({
      tableId: table.tableId,
      key0: matchEntity as Hex,
    })),
  ];

  return filters;
}
