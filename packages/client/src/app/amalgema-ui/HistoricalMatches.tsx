import { Caption, OverlineSmall } from "../ui/Theme/SkyStrife/Typography";
import { useAmalgema } from "../../useAmalgema";
import { useEntityQuery } from "@latticexyz/react";
import { Has, getComponentValue } from "@latticexyz/recs";
import { MatchCard } from "./MatchCard";
import { usePagination } from "./hooks/usePagination";

export function HistoricalMatches() {
  const {
    components: { MatchConfig, MatchReady, MatchFinished },
  } = useAmalgema();

  const matches = useEntityQuery([Has(MatchConfig), Has(MatchReady), Has(MatchFinished)]);
  matches.sort((a, b) => {
    const aTime = getComponentValue(MatchConfig, a)?.startTime ?? 0n;
    const bTime = getComponentValue(MatchConfig, b)?.startTime ?? 0n;
    return Number(bTime - aTime);
  });

  const { page, form: paginationForm } = usePagination({ totalItems: matches.length, pageSize: 9 });

  const shownMatches = matches.slice((page - 1) * 9, page * 9);

  return (
    <div>
      <div className="flex flex-row items-baseline">
        <OverlineSmall className="mb-4 uppercase">Past Matches ({matches.length})</OverlineSmall>

        <div className="flex-grow" />

        {paginationForm}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {matches.length === 0 && (
          <div className="w-full h-[200px] border border-ss-stroke rounded flex flex-col justify-around bg-ss-bg-0 col-span-3">
            <Caption className="text-center">No past islands</Caption>
          </div>
        )}
        {shownMatches.map((i) => {
          return (
            <div key={i}>
              <MatchCard matchEntity={i} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
