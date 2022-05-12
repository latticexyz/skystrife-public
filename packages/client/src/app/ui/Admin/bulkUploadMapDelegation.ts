import { Hex, stringToHex } from "viem";
import { NetworkLayer } from "../../../layers/Network";
import { chunk } from "@latticexyz/common/utils";
import { encodeSystemCallFrom } from "@latticexyz/world";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { Level } from "./bulkUploadMap";
import { LEVEL_UPLOAD_SYSTEM_ID } from "../../../constants";

const STATE_UPDATES_PER_TX = 25;

export async function bulkUploadMapDelegation(layer: NetworkLayer, from: Hex, level: Level, name: string) {
  const { waitForTransaction, worldContract } = layer.network;

  console.log(`Uploading ${name} level`);

  const chunkedState = Array.from(chunk(level, STATE_UPDATES_PER_TX));
  const txs = await Promise.all(
    chunkedState.map((stateChunk) => {
      const levelId = stringToHex(name, { size: 32 });
      const templateIds = stateChunk.map((s) => stringToHex(s.templateId, { size: 32 }));
      const xs = stateChunk.map((s) => s.values.Position.x);
      const ys = stateChunk.map((s) => s.values.Position.y);

      return worldContract.write.callFrom(
        encodeSystemCallFrom({
          abi: IWorldAbi,
          from,
          systemId: LEVEL_UPLOAD_SYSTEM_ID,
          functionName: "uploadLevel",
          args: [levelId, templateIds, xs, ys],
        })
      );
    })
  );

  for (const tx of txs) {
    await waitForTransaction(tx);
  }

  console.log(`Uploaded ${name} level!`);
}
