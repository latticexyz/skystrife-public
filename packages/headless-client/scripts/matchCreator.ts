import { Entity, Has, Not, getComponentValue, runQuery } from "@latticexyz/recs";
import { env, createSkyStrife } from "../src/createSkyStrife";
import { Hex, padHex, stringToHex } from "viem";
import { sleep } from "@latticexyz/utils";
import { createMatchEntity } from "client/src/createMatchEntity";
import { getOldestMatchInWindow, getSkypoolConfig } from "client/src/app/amalgema-ui/utils/skypool";
import { COPY_MAP_SYSTEM_ID, MATCH_SYSTEM_ID } from "client/src/constants";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { encodeSystemCalls } from "@latticexyz/world/internal";

const { networkLayer } = await createSkyStrife();

const {
  components: { MatchConfig, MatchFinished },
  executeSystem,
} = networkLayer;

const LEVEL_NAME = env.LEVEL_ID || "GM Island";
console.log(`Creating matches with level: ${LEVEL_NAME}`);
const LEVEL_ID = stringToHex(LEVEL_NAME, { size: 32 });

// eslint-disable-next-line no-constant-condition
while (true) {
  const allMatches = runQuery([Has(MatchConfig), Not(MatchFinished)]);
  const unstartedMatches = [] as Entity[];

  for (const matchEntity of allMatches) {
    const matchConfig = getComponentValue(MatchConfig, matchEntity);
    if (matchConfig && matchConfig.startTime === 0n) {
      unstartedMatches.push(matchEntity);
    }
  }

  console.log(`Unstarted matches: ${unstartedMatches.length}`);
  if (unstartedMatches.length < 1) {
    const skypoolConfig = getSkypoolConfig(networkLayer);
    if (!skypoolConfig) continue;

    const oldestMatchInWindow = getOldestMatchInWindow(
      networkLayer,
      BigInt(Math.round(Date.now() / 1000)),
      skypoolConfig.window,
    );

    const matchEntity = createMatchEntity();
    try {
      console.log(`Creating match...`);
      const systemCalls = [
        {
          systemId: MATCH_SYSTEM_ID,
          functionName: "createMatchSkyKey",
          args: [
            "debug match",
            (oldestMatchInWindow as Hex) ?? matchEntity,
            matchEntity,
            LEVEL_ID,
            padHex("0x"),
            0n,
            [],
            0n,
          ],
        },
        {
          systemId: COPY_MAP_SYSTEM_ID,
          functionName: "copyMap",
          args: [matchEntity],
        },
      ];

      await executeSystem({
        systemCall: "batchCall",
        systemId: "CreateMatch",
        args: [[encodeSystemCalls(IWorldAbi, systemCalls).map(([systemId, callData]) => ({ systemId, callData }))], {}],
      });
    } catch (e) {
      console.error(e);
    }

    console.log(`Created match!`);
  }

  await sleep(10_000);
}
