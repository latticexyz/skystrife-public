import { stringToHex } from "viem";
import { NetworkLayer } from "../../../layers/Network";
import { chunk } from "@latticexyz/common/utils";

export type Level = Array<{
  templateId: string;
  values: object;
}>;

const STATE_UPDATES_PER_TX = 25;

export async function bulkUploadMap(layer: NetworkLayer, level: Level, name: string) {
  console.log(`Uploading ${name} level`);

  const chunkedState = Array.from(chunk(level, STATE_UPDATES_PER_TX));
  const txs = await Promise.all(
    chunkedState.map((stateChunk) => {
      const levelId = stringToHex(name, { size: 32 });
      const templateIds = stateChunk.map((s) => stringToHex(s.templateId, { size: 32 }));
      const xs = stateChunk.map((s) => s.values.Position.x);
      const ys = stateChunk.map((s) => s.values.Position.y);

      return layer.network.worldContract.write.uploadLevel([levelId, templateIds, xs, ys]);
    })
  );

  for (const tx of txs) {
    await layer.network.waitForTransaction(tx);
  }

  console.log(`Uploaded ${name} level!`);
}
