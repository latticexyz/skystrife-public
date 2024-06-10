import { bulkUploadMap } from "client/src/app/ui/Admin/bulkUploadMap";
import { stringToHex } from "viem";
import { createSkyStrife } from "../src/createSkyStrife";
import gmIsland from "../../../maps/gm-island.json" assert { type: "json" };
import Vortex from "../../../maps/*official/4p-vortex.json" assert { type: "json" };
import Scatter from "../../../maps/*official/3p-scatter.json" assert { type: "json" };
import Rumble from "../../../maps/*official/4p-rumble-community.json" assert { type: "json" };
import TwoPlayer from "../../../maps/*official/2p-isle.json" assert { type: "json" };

export type Level = Array<{
  templateId: string;
  values: object;
}>;

const { networkLayer } = await createSkyStrife();
const {
  network: { walletClient, worldContract },
} = networkLayer;

const address = walletClient?.account?.address;
if (!address) throw new Error("no connected account");

await Promise.all([
  bulkUploadMap(networkLayer, address, gmIsland as Level, "GM Island"),
  bulkUploadMap(networkLayer, address, TwoPlayer as Level, "Two Player"),
  bulkUploadMap(networkLayer, address, Vortex as Level, "Vortex"),
]);

await worldContract.write.setRotationStandard([stringToHex("GM Island", { size: 32 }), true]);
await worldContract.write.setRotationStandard([stringToHex("Two Player", { size: 32 }), true]);
await worldContract.write.setRotationStandard([stringToHex("Vortex", { size: 32 }), true]);

process.exit(0);
