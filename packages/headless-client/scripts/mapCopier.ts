import { Hex } from "viem";
import { Has, Not, getComponentValue, getComponentValueStrict, runQuery } from "@latticexyz/recs";
import { sleep } from "@latticexyz/utils";
import { env, createSkyStrife } from "../src/createSkyStrife";

const { networkLayer, createPlayer } = await createSkyStrife();

const mapCopier = createPlayer(env.PRIVATE_KEY);

async function copyMaps() {
  const {
    components: { MatchIndex, MatchConfig, MatchReady },
    network: { waitForTransaction },
  } = networkLayer;

  for (;;) {
    const pendingMatches = [...runQuery([Has(MatchConfig), Not(MatchReady)])];

    for (const matchEntity of pendingMatches) {
      while (!getComponentValue(MatchReady, matchEntity)?.value) {
        const { matchIndex } = getComponentValueStrict(MatchIndex, matchEntity);
        console.log(`Copying map ${matchIndex}...`);
        try {
          const tx = await mapCopier.worldContract.write.copyMap([matchEntity as Hex]);
          await waitForTransaction(tx);
        } catch (e) {
          console.error(e);
        }
      }
    }

    await sleep(1000);
  }
}

copyMaps();
