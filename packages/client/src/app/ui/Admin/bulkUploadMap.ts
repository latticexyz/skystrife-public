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
  await Promise.all(
    chunkedState.map(async (stateChunk) => {
      const levelId = stringToHex(name, { size: 32 });
      const templateIds = stateChunk.map((s) => stringToHex(s.templateId, { size: 32 }));
      const xs = stateChunk.map((s) => s.values.Position.x);
      const ys = stateChunk.map((s) => s.values.Position.y);

      let success = false;
      let retryCount = 0;

      while (!success && retryCount < 3) {
        try {
          const tx = await layer.network.worldContract.write.uploadLevel([levelId, templateIds, xs, ys]);
          await layer.network.waitForTransaction(tx);
          success = true;
        } catch (e) {
          console.log(e);
          retryCount++;
          continue;
        }
      }

      if (!success) {
        throw new Error(`Failed to upload ${name} level`);
      }

      return true;
    })
  );

  console.log(`Uploaded ${name} level!`);
}
