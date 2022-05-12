import { Caption, OverlineSmall } from "../ui/Theme/SkyStrife/Typography";
import { useAmalgema } from "../../useAmalgema";
import { useEntityQuery } from "@latticexyz/react";
import { Has, Not, getComponentValueStrict } from "@latticexyz/recs";
import { MatchCard } from "./MatchCard";
import { usePagination } from "./hooks/usePagination";

export function LiveMatches() {
  const {
    components: { MatchConfig, MatchReady, MatchFinished },
    utils: { matchIsLive },
  } = useAmalgema();

  const matches = useEntityQuery([Has(MatchConfig), Has(MatchReady), Not(MatchFinished)]);

  const oneHour = 60n * 60n;
  const liveLobbies = matches.filter(
    (matchEntity) =>
      matchIsLive(matchEntity) &&
      getComponentValueStrict(MatchConfig, matchEntity)?.startTime + oneHour > BigInt(Math.floor(Date.now() / 1000))
  );

  const { page, form: paginationForm } = usePagination({ totalItems: liveLobbies.length, pageSize: 9 });
  const shownMatches = liveLobbies.slice((page - 1) * 9, page * 9);

  return (
    <div>
      <div className="w-full flex items-baseline text-ss-text-light">
        <OverlineSmall className="mb-4 uppercase">Live Matches ({liveLobbies.length})</OverlineSmall>

        <div className="flex-grow" />

        {paginationForm}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {liveLobbies.length === 0 && (
          <div className="w-full h-[200px] border border-ss-stroke rounded flex flex-col justify-around bg-ss-bg-0 col-span-3">
            <Caption className="text-center">No live matches</Caption>
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
