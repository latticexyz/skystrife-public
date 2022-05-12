import { bulkUploadMap } from "client/src/app/ui/Admin/bulkUploadMap";
import { headlessSetup } from "./headlessSetup";
import debug from "../../../maps/debug.json" assert { type: "json" };
import Cauldron from "../../../maps/4p-cauldron.json" assert { type: "json" };
import KnifeFight from "../../../maps/2p-knife-fight.json" assert { type: "json" };
import Aviary from "../../../maps/2p-isle.json" assert { type: "json" };
import Antelope from "../../../maps/3p-antelope.json" assert { type: "json" };

export type Level = Array<{
  templateId: string;
  values: object;
}>;

const { networkLayer } = await headlessSetup();

await Promise.all([
  bulkUploadMap(networkLayer, debug as Level, "debug"),
  bulkUploadMap(networkLayer, Cauldron as Level, "Cauldron"),
  bulkUploadMap(networkLayer, KnifeFight as Level, "KnifeFight"),
  bulkUploadMap(networkLayer, Aviary as Level, "Aviary"),
  bulkUploadMap(networkLayer, Antelope as Level, "Antelope"),
]);

process.exit(0);
