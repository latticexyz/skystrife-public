import { useMatchInfo } from "../hooks/useMatchInfo";
import { useAllPlayerDetails } from "../hooks/usePlayerDetails";
import { Card } from "../Theme/SkyStrife/Card";
import { PlayerCard } from "./PlayerCard";
import { Entity } from "@latticexyz/recs";
import { useMatchStarted } from "../hooks/useMatchStarted";
import { useMUD } from "../../../useMUD";
import { useComponentValue } from "@latticexyz/react";

export const Leaderboard = ({ matchEntity }: { matchEntity: Entity }) => {
  const {
    networkLayer: {
      components: { MatchRanking },
    },
  } = useMUD();
  // needed to re-render when a player is eliminated
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const matchRanking = useComponentValue(MatchRanking, matchEntity);

  const playerData = useAllPlayerDetails(matchEntity);

  const matchStarted = useMatchStarted(matchEntity);
  const { matchFinished } = useMatchInfo(matchEntity);
  if (!matchStarted || matchFinished) return <></>;

  return (
    <div className="absolute flex h-fit w-[340px] flex-col items-center">
      <Card primary className="p-2 border-[#181710]">
        <div>
          <ul
            style={{
              width: "100%",
              padding: "8px",
            }}
          >
            <li className="flex flex-row gap-2.5 text-xs uppercase tracking-wider text-ss-text-x-light mb-2">
              <div className="w-[120px] grow-0">player</div>
              <div className="grow basis-1">army size</div>
              <div className="grow basis-1">gold/turn</div>
            </li>

            {playerData.length === 0 && (
              <li className="flex flex-row gap-2.5 text-xs">
                <div className="w-[120px] grow-0">n/a</div>
                <div className="grow basis-1">-</div>
                <div className="grow basis-1">-</div>
              </li>
            )}

            {playerData.map((player) => {
              if (!player) return <li></li>;

              return <PlayerCard key={`${player.player}`} playerData={player} />;
            })}
          </ul>
        </div>
      </Card>
    </div>
  );
};
