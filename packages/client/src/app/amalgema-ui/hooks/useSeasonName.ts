import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useAmalgema } from "../../../useAmalgema";
import { useComponentValue } from "@latticexyz/react";
import { hexToString, stringToHex, Hex } from "viem";

export function useSeasonName() {
  const {
    components: { SeasonPassNamespace },
  } = useAmalgema();

  const rawName = hexToString(
    (useComponentValue(SeasonPassNamespace, singletonEntity)?.value as Hex) || stringToHex("UNKNOWN", { size: 14 }),
    { size: 14 },
  );

  const formattedName = rawName.replace(/(\w+)(\d+)/, "$1 $2");
  return formattedName;
}
