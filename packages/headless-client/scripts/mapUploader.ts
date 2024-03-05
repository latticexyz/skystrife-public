import { bulkUploadMap } from "client/src/app/ui/Admin/bulkUploadMap";
import { createSkyStrife } from "../src/createSkyStrife";
import debug from "../../../maps/debug.json" assert { type: "json" };
import gmIsland from "../../../maps/gm-island.json" assert { type: "json" };
import Cauldron from "../../../maps/*official/4p-pinwheel.json" assert { type: "json" };
import KnifeFight from "../../../maps/*official/2p-knife-fight-v2.json" assert { type: "json" };
import Aviary from "../../../maps/*official/2p-isle.json" assert { type: "json" };
import Antelope from "../../../maps/*official/3p-antelope-v2.json" assert { type: "json" };

export type Level = Array<{
  templateId: string;
  values: object;
}>;

const {
  networkLayer,
  networkLayer: {
    network: { walletClient },
  },
} = await createSkyStrife();

await Promise.all([
  bulkUploadMap(networkLayer, walletClient.account.address, debug as Level, "debug"),
  bulkUploadMap(networkLayer, walletClient.account.address, gmIsland as Level, "GM Island"),
  bulkUploadMap(networkLayer, walletClient.account.address, Cauldron as Level, "Cauldron"),
  bulkUploadMap(networkLayer, walletClient.account.address, KnifeFight as Level, "KnifeFight"),
  bulkUploadMap(networkLayer, walletClient.account.address, Aviary as Level, "Aviary"),
  bulkUploadMap(networkLayer, walletClient.account.address, Antelope as Level, "Antelope"),
]);

process.exit(0);
