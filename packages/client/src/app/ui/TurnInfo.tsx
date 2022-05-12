import { EnergySurge } from "./EnergySurge";
import { GoldAmount } from "./GoldAmount";
import { useMatchInfo } from "./hooks/useMatchInfo";
import { Card } from "../ui/Theme/SkyStrife/Card";
import { Entity } from "@latticexyz/recs";
import { useExternalInMatch } from "./hooks/useExternalInMatch";
import { useMatchStarted } from "./hooks/useMatchStarted";

export function TurnInfo({ matchEntity }: { matchEntity: Entity }) {
  const inMatch = useExternalInMatch(matchEntity);

  const matchStarted = useMatchStarted(matchEntity);
  const { matchFinished } = useMatchInfo(matchEntity);
  if (!matchStarted || matchFinished) return <></>;

  return (
    <div className="absolute left-1/2 -translate-x-1/2">
      {inMatch ? (
        <Card className="w-full border-[#181710]">
          <GoldAmount matchEntity={matchEntity} />
        </Card>
      ) : null}
      <div className="h-1"></div>
      <div className="h-fit w-full flex flex-col items-baseline">
        <EnergySurge />
      </div>
    </div>
  );
}
