import { Entity, getComponentValue } from "@latticexyz/recs";
import { useAmalgema } from "../../useAmalgema";
import { useComponentValue } from "@latticexyz/react";
import { PendingMatch } from "./PendingMatch";
import { LiveMatch } from "./LiveMatch";
import { OpenMatch } from "./OpenMatch";
import { HistoricalMatch } from "./HistoricalMatch";

export function MatchCard({ matchEntity }: { matchEntity: Entity }) {
  const {
    components: { MatchReady, MatchFinished },
    utils: { matchIsLive },
  } = useAmalgema();

  const matchReady = useComponentValue(MatchReady, matchEntity);
  const matchFinished = getComponentValue(MatchFinished, matchEntity);

  const isPending = Boolean(!matchReady);
  const isOpen = Boolean(matchReady) && !matchIsLive(matchEntity);
  const isLive = !matchFinished && Boolean(matchIsLive(matchEntity));

  return (
    <>
      {isPending && <PendingMatch matchEntity={matchEntity} />}
      {isOpen && <OpenMatch matchEntity={matchEntity} />}
      {isLive && <LiveMatch matchEntity={matchEntity} />}
      {matchFinished && <HistoricalMatch matchEntity={matchEntity} />}
    </>
  );
}
