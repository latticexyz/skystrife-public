import { useComponentValue } from "@latticexyz/react";
import { SEASON_NAME } from "../../../constants";
import { DISCORD_URL } from "../../links";
import { CrossIcon } from "../../ui/Theme/CrossIcon";
import { Card } from "../../ui/Theme/SkyStrife/Card";
import { Body, Heading, Link } from "../../ui/Theme/SkyStrife/Typography";
import useLocalStorageState from "use-local-storage-state";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useAmalgema } from "../../../useAmalgema";
import { DateTime } from "luxon";
import { SeasonPassImg } from "../SeasonPassImg";

export function Welcome() {
  const {
    components: { SeasonTimes },
  } = useAmalgema();

  const seasonTimes = useComponentValue(SeasonTimes, singletonEntity);
  const seasonEnd = DateTime.fromSeconds(Number(seasonTimes?.seasonEnd || 0)).setZone("GMT");

  const [open, setOpen] = useLocalStorageState("welcome-open", {
    defaultValue: true,
  });
  return (
    <>
      {open ? (
        <Card primary className="">
          <div className="flex flex-row items-start justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex flex-row gap-4 items-center">
                <SeasonPassImg className="w-[100px] -ml-2" />
                <div className="flex flex-col">
                  <Heading className="text-[#1A6CBC]">Welcome to {SEASON_NAME}!</Heading>
                  <Heading>Daily matches until {seasonEnd.toLocaleString(DateTime.DATETIME_HUGE)}</Heading>
                </div>
              </div>
              <div className="flex flex-row justify-between">
                <Body>
                  Sky Strife is back! To learn more about Sky Strife, Seasons, and more, join our{" "}
                  <Link href={DISCORD_URL}>Discord</Link>.
                </Body>
              </div>
            </div>
            <button onClick={() => setOpen(false)}>
              <CrossIcon />
            </button>
          </div>
        </Card>
      ) : null}
    </>
  );
}
