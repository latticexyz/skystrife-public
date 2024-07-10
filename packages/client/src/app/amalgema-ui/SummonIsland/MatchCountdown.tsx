import { Duration, DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";
import { Card } from "../../ui/Theme/SkyStrife/Card";
import { Link, OverlineSmall } from "../../ui/Theme/SkyStrife/Typography";
import { HOURS_BETWEEN_MATCHES, createMatchTimes } from "../utils/matchSchedule";
import { useSeasonName } from "../hooks/useSeasonName";
import { useSeasonTimes } from "../hooks/useSeasonTimes";
import { DISCORD_URL } from "../../links";

function nowGmt() {
  return DateTime.now().setZone("GMT");
}

function SeasonStarting({
  seasonName,
  durationUntilSeasonStart,
  seasonStart,
  userTimezone,
}: {
  seasonName: string;
  durationUntilSeasonStart: Duration;
  seasonStart: DateTime;
  userTimezone: string;
}) {
  return (
    <Card primary>
      <div className="flex flex-row justify-between">
        <OverlineSmall>{seasonName} starting soon!</OverlineSmall>
        <OverlineSmall>time until season start:</OverlineSmall>
      </div>
      <div className="flex flex-row justify-between">
        <div className="w-[640px]">
          {seasonName} starts {seasonStart.toFormat("MMMM d, yyyy")} at {seasonStart.toFormat("h:mm a")} ({userTimezone}
          ). <br />
          New seasons begin with numerous free matches, don&apos;t miss out!
        </div>
        <div className="text-4xl font-medium font-mono">{durationUntilSeasonStart.toFormat("dd:hh:mm:ss")}</div>
      </div>
    </Card>
  );
}

function SeasonOver({ seasonName }: { seasonName: string }) {
  return (
    <Card primary>
      <div className="flex flex-row justify-between">
        <OverlineSmall>{seasonName} has ended</OverlineSmall>
      </div>
      <div className="flex flex-row justify-between">
        <div className="w-[640px]">
          Check{" "}
          <Link style={{ fontSize: "16px" }} href={DISCORD_URL}>
            Discord
          </Link>{" "}
          for more information about the next season!
        </div>
      </div>
    </Card>
  );
}

export function MatchCountdown() {
  const { isSeasonActive, seasonStart, seasonEnd } = useSeasonTimes();
  const seasonName = useSeasonName();

  const [now, setNow] = useState(nowGmt());
  const matchTimes = useMemo(() => createMatchTimes(now), [now]);
  const closestMatchTime = matchTimes.find((time) => time > now) || matchTimes[0];
  const durationToClosestMatch = Duration.fromObject({ seconds: closestMatchTime.diff(now).as("seconds") });

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(nowGmt());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  if (!isSeasonActive && now < seasonStart) {
    return (
      <SeasonStarting
        seasonName={seasonName}
        durationUntilSeasonStart={seasonStart.diff(now)}
        seasonStart={seasonStart}
        userTimezone={userTimezone}
      />
    );
  }

  if (!isSeasonActive && now > seasonEnd) {
    return <SeasonOver seasonName={seasonName} />;
  }

  return (
    <Card primary>
      <div className="flex flex-row justify-between">
        <OverlineSmall>{seasonName} active</OverlineSmall>
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
