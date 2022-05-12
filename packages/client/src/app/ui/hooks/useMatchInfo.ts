import { useComponentValue } from "@latticexyz/react";
import { Entity } from "@latticexyz/recs";
import { Hex, hexToString } from "viem";
import { useAmalgema } from "../../../useAmalgema";

export const useMatchInfo = (matchEntity: Entity) => {
  const {
    components: { MatchConfig, MatchFinished, MatchName },
  } = useAmalgema();

  const matchConfig = useComponentValue(MatchConfig, matchEntity);
  const matchFinished = useComponentValue(MatchFinished, matchEntity);
  const matchName =
    useComponentValue(MatchName, matchEntity)?.value ?? hexToString((matchConfig?.levelId ?? "0x00") as Hex);

  return {
    matchEntity,
    matchConfig: matchConfig,
    matchFinished: matchFinished?.value,
    matchName,
  };
};
