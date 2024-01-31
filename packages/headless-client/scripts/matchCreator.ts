import { Entity, Has, Not, getComponentValue, runQuery } from "@latticexyz/recs";
import { env, createSkyStrife } from "../src/createSkyStrife";
import { Hex, padHex, stringToHex } from "viem";
import { sleep } from "@latticexyz/utils";
import { createMatchEntity } from "client/src/createMatchEntity";
import { getOldestMatchInWindow, getSkypoolConfig } from "client/src/app/amalgema-ui/utils/skypool";

const { networkLayer } = await createSkyStrife();

const {
  components: { MatchConfig, MatchFinished, LevelTemplates },
  network: { worldContract, waitForTransaction },
} = networkLayer;

const LEVEL_NAME = env.LEVEL_ID || "debug";
console.log(`Creating matches with level: ${LEVEL_NAME}`);
const LEVEL_ID = stringToHex(LEVEL_NAME, { size: 32 });

// eslint-disable-next-line no-constant-condition
while (true) {
  if (!getComponentValue(LevelTemplates, LEVEL_ID as Entity)) {
    console.log(`Level (${LEVEL_NAME}) is not yet available, waiting...`);
    await sleep(1_000);
    continue;
  }

  console.log("Waiting some time to let PostDeploy finish...");
  await sleep(5_000);

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
      skypoolConfig.window
    );

    const matchEntity = createMatchEntity();
    try {
      console.log(`Creating match...`);
      const tx = await worldContract.write.createMatchSkyKey([
        "debug match",
        (oldestMatchInWindow as Hex) ?? matchEntity,
        matchEntity,
        LEVEL_ID,
        padHex("0x"),
        0n,
        [],
        0n,
      ]);
      await waitForTransaction(tx);
    } catch (e) {
      console.error(e);
    }

    console.log(`Created match!`);
  }

  await sleep(10_000);
}
