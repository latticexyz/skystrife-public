import { Duration, DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";
import { Card } from "../../ui/Theme/SkyStrife/Card";
import { OverlineSmall } from "../../ui/Theme/SkyStrife/Typography";
import { SEASON_NAME } from "../../../constants";
import { HOURS_BETWEEN_MATCHES, createMatchTimes } from "../utils/matchSchedule";

function nowGmt() {
  return DateTime.now().setZone("GMT");
}

export function MatchCountdown() {
  const [now, setNow] = useState(nowGmt());
  const matchTimes = useMemo(() => createMatchTimes(now), [now]);
  const closestMatchTime = matchTimes.find((time) => time > now) || matchTimes[0];
  const durationToClosestMatch = Duration.fromObject({ seconds: closestMatchTime.diff(now).as("seconds") });

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(nowGmt());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Card primary>
      <div className="flex flex-row justify-between">
        <OverlineSmall>{SEASON_NAME} matches</OverlineSmall>
        <OverlineSmall>matches summoned in:</OverlineSmall>
      </div>
      <div className="flex flex-row justify-between">
        <div className="w-[640px]">
          Matches are created every {HOURS_BETWEEN_MATCHES} hours. There are normal, free matches, and matches exclusive
          to Season Pass holders.
        </div>
        <div className="text-4xl font-medium font-mono">{durationToClosestMatch.toFormat("hh:mm:ss")}</div>
      </div>
    </Card>
  );
}
