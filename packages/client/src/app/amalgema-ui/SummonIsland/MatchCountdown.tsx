import { Duration, DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";
import { Card } from "../../ui/Theme/SkyStrife/Card";
import { OverlineSmall } from "../../ui/Theme/SkyStrife/Typography";
import { SEASON_NAME } from "../../../constants";

function nowGmt() {
  return DateTime.now().setZone("GMT");
}

export function MatchCountdown() {
  const [now, setNow] = useState(nowGmt());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(nowGmt());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const midday = useMemo(() => {
    let time = nowGmt();
    if (time.hour >= 12) {
      time = time.plus(Duration.fromObject({ days: 1 }));
    }
    time = time.set({ hour: 12, minute: 0, second: 0, millisecond: 0 });

    return time;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  const midnight = useMemo(() => {
    let time = nowGmt();
    time = time.set({ hour: 24, minute: 0, second: 0, millisecond: 0 });

    return time;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  const timeUntilMidday = Duration.fromObject({ milliseconds: midday.toMillis() - now.toMillis() });
  const timeUntilMidnight = Duration.fromObject({ milliseconds: midnight.toMillis() - now.toMillis() });

  return (
    <Card primary>
      <div className="flex flex-row justify-between">
        <OverlineSmall>{SEASON_NAME} matches</OverlineSmall>
        <OverlineSmall>matches summoned in:</OverlineSmall>
      </div>
      <div className="flex flex-row justify-between">
        <div className="w-[640px]">
          Matches will be summoned everyday at 12:00am and 12:00pm GMT. There will be normal, free matches, and matches
          exclusive to Season Pass holders.
        </div>
        <div className="text-4xl font-medium font-mono">
          {timeUntilMidday > timeUntilMidnight
            ? timeUntilMidnight.toFormat("hh:mm:ss")
            : timeUntilMidday.toFormat("hh:mm:ss")}
        </div>
      </div>
    </Card>
  );
}
