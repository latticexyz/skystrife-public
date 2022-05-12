import { createPublicClient, fallback, webSocket, http, Hex, PublicClient, Transport, Chain } from "viem";
import { supportedChains } from "client/src/mud/supportedChains";
import { syncToRecs } from "@latticexyz/store-sync/recs";
import {
  World,
  runQuery,
  Has,
  Component,
  getComponentValueStrict,
  defineEnterSystem,
  getComponentValue,
} from "@latticexyz/recs";
import mudConfig from "contracts/mud.config";
import { z } from "zod";
import { createAnalyticsLayer } from "./createAnalyticsLayer";
import { Observable } from "rxjs";
import { stringify } from "csv/sync";
import fs from "fs";
import { world } from "./world";
import { getWorldFromChainId } from "./utils";
import { tables } from "client/src/mud/extraTables";

export type NetworkResult = {
  world: World;
  components: typeof components;
  latestBlockNumber$: Observable<bigint>;
  publicClient: PublicClient<Transport, Chain>;
};

const env = z
  .object({
    CHAIN_ID: z.coerce.number().positive(),
  })
  .parse(process.env, {
    errorMap: (issue) => ({
      message: `Missing or invalid environment variable: ${issue.path.join(".")}`,
    }),
  });

const chain = supportedChains.find((c) => c.id === env.CHAIN_ID);
if (!chain) {
  throw new Error(`Unsupported chain: ${env.CHAIN_ID}`);
}

const worldSpec = getWorldFromChainId(chain.id);

const worldAddress = worldSpec?.address;
if (!worldAddress) {
  throw new Error(`Missing world address`);
}

const startBlock = (worldSpec && worldSpec.blockNumber) || 0;

const publicClient = createPublicClient({
  chain,
  transport: fallback([webSocket(), http()]),
  pollingInterval: 1000,
});

const { components, latestBlockNumber$ } = await syncToRecs({
  world,
  config: mudConfig,
  address: worldAddress as Hex,
  publicClient,
  startBlock: BigInt(startBlock),
  tables,
});

const networkResult = {
  world,
  components,
  latestBlockNumber$,
  publicClient,
};

const analyticsLayer = await createAnalyticsLayer(networkResult);

setInterval(() => {
  const {
    components,
    utils: { getCurrentBlockNumber },
  } = analyticsLayer;

  console.log("-------------------");
  console.log(`Block: ${getCurrentBlockNumber()}`);

  for (const [key, component] of Object.entries(components)) {
    const numberOfEntities = [...runQuery([Has(component as Component)])].length;
    console.log(`${key}: ${numberOfEntities}`);
  }
}, 5_000);

const {
  networkLayer: {
    components: { MatchFinished, Match, SyncProgress, MatchConfig },
  },
  components: { UnitBuy, UnitKill, UnitDeath, UnitSnapshot, StructureSnapshot, StructureKill, StructureCapture },
} = analyticsLayer;

defineEnterSystem(world, [Has(MatchFinished), Has(Match), Has(MatchConfig)], ({ entity }) => {
  setTimeout(() => {
    const matchEntity = getComponentValue(Match, entity)?.matchEntity;
    if (!matchEntity) return;

    const matchSpecificEventComponents = {
      UnitBuy,
      UnitKill,
      UnitDeath,
      UnitSnapshot,
      StructureSnapshot,
      StructureKill,
      StructureCapture,
    } as Record<string, Component>;

    Object.entries(matchSpecificEventComponents).forEach(([name, component]) => {
      const entities = [...runQuery([Has(component)])];
      const events = entities
        .map((e) => getComponentValueStrict(component, e))
        .filter((e) => e.matchEntity === matchEntity);

      if (events.length === 0) return;

      const header = Object.keys(events[0]);
      const rows = events.map((e) => Object.values(e));
      const csv = stringify([header, ...rows]);

      console.log(`CSV Generated for ${name}`);
      fs.mkdirSync(`data/match-${matchEntity}`, { recursive: true });

      fs.writeFileSync(`data/match-${matchEntity}/${name}.csv`, csv);
    });
  }, 15_000);
});

setInterval(() => {
  const { components } = analyticsLayer;

  const periodicGenerationComponents = {
    EndMatch: components.EndMatch,
    JoinMatch: components.JoinMatch,
    CreateMatch: components.CreateMatch,
    TokenBalanceSnapshot: components.TokenBalanceSnapshot,
  } as Record<string, Component>;

  Object.entries(periodicGenerationComponents).forEach(([name, component]) => {
    const entities = [...runQuery([Has(component)])];
    const events = entities.map((e) => getComponentValueStrict(component, e));

    if (events.length === 0) return;

    const header = Object.keys(events[0]);
    const rows = events.map((e) => Object.values(e));
    const csv = stringify([header, ...rows]);

    console.log(`CSV Generated for ${name}`);
    fs.mkdirSync(`data/${name}`, { recursive: true });

    fs.writeFileSync(`data/${name}/${name}.csv`, csv);
  });
}, 5_000);

SyncProgress.update$.subscribe((progress) => {
  const [val] = progress.value;

  console.log(
    `Sync Progress: ${JSON.stringify({
      step: val?.step,
      message: val?.message,
      percentage: val?.percentage,
    })}`
  );
});
