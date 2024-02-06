import { bulkUploadMap } from "client/src/app/ui/Admin/bulkUploadMap";
import { createSkyStrife } from "../src/createSkyStrife";
import debug from "../../../maps/debug.json" assert { type: "json" };
import Cauldron from "../../../maps/4p-cauldron.json" assert { type: "json" };
import KnifeFight from "../../../maps/2p-knife-fight.json" assert { type: "json" };
import Aviary from "../../../maps/2p-isle.json" assert { type: "json" };
import Antelope from "../../../maps/3p-antelope.json" assert { type: "json" };

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
  bulkUploadMap(networkLayer, walletClient.account.address, Cauldron as Level, "Cauldron"),
  bulkUploadMap(networkLayer, walletClient.account.address, KnifeFight as Level, "KnifeFight"),
  bulkUploadMap(networkLayer, walletClient.account.address, Aviary as Level, "Aviary"),
  bulkUploadMap(networkLayer, walletClient.account.address, Antelope as Level, "Antelope"),
]);

process.exit(0);
