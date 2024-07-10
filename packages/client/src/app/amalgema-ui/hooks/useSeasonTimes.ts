import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useAmalgema } from "../../../useAmalgema";
import { useCurrentTime } from "./useCurrentTime";
import { DateTime } from "luxon";
import { useComponentValue } from "@latticexyz/react";

export function useSeasonTimes() {
  const {
    components: { SeasonTimes },
  } = useAmalgema();

  const seasonTimes = useComponentValue(SeasonTimes, singletonEntity);
  const seasonStart = DateTime.fromSeconds(Number(seasonTimes?.seasonStart ?? 0n));
  const seasonEnd = DateTime.fromSeconds(Number(seasonTimes?.seasonEnd ?? 0n));

  const now = useCurrentTime();

  const isSeasonActive = now > seasonStart && now < seasonEnd;

  return {
    isSeasonActive,
    seasonStart,
    seasonEnd,
  };
}
