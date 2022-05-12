import { Caption, OverlineSmall } from "../ui/Theme/SkyStrife/Typography";
import { useAmalgema } from "../../useAmalgema";
import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, Not, getComponentValueStrict } from "@latticexyz/recs";
import { MatchCard } from "./MatchCard";
import { useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import { usePagination } from "./hooks/usePagination";

const BUGGED_MATCHES = [] as Entity[];

export function OpenOrPendingMatches() {
  const {
    components: { MatchConfig, MatchReady },
    utils: { matchIsLive },
  } = useAmalgema();

  const [currentTime, setCurrentTime] = useState(DateTime.now().toSeconds());
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(DateTime.now().toSeconds());
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const openMatches = useEntityQuery([Has(MatchConfig), Has(MatchReady)]);
  const pendingMatches = useEntityQuery([Has(MatchConfig), Not(MatchReady)]);
  const allMatches = openMatches.concat(pendingMatches);

  const openOrPendingMatches = useMemo(() => {
    return allMatches.filter((matchEntity) => {
      if (BUGGED_MATCHES.includes(matchEntity)) return false;

      const matchIsNotLive = !matchIsLive(matchEntity);
      const registrationOpen =
        getComponentValueStrict(MatchConfig, matchEntity).registrationTime <= BigInt(Math.floor(currentTime));

      return matchIsNotLive && registrationOpen;
    });
  }, [MatchConfig, allMatches, currentTime, matchIsLive]);

  const totalMatches = openOrPendingMatches.length;
  const pageSize = 9;
  const { page, form: paginationForm } = usePagination({ totalItems: totalMatches, pageSize });
  const shownMatches = openOrPendingMatches.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="w-full flex items-baseline text-ss-text-light">
        <OverlineSmall className="mb-4 uppercase">Open Matches ({totalMatches})</OverlineSmall>

        <div className="flex-grow" />

        {paginationForm}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {openOrPendingMatches.length === 0 && (
          <div className="w-full h-[200px] border border-ss-stroke rounded flex flex-col justify-around bg-ss-bg-0 col-span-3">
            <Caption className="text-center">No matches currently available</Caption>
          </div>
        )}

        {shownMatches.map((i) => {
          return (
            <div key={`open-match-${i}`}>
              <MatchCard matchEntity={i} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
