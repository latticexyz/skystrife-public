import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { useSeasonName } from "./hooks/useSeasonName";
import { useSeasonTimes } from "./hooks/useSeasonTimes";
import { Body, Link } from "../ui/Theme/SkyStrife/Typography";
import { useCurrentTime } from "./hooks/useCurrentTime";
import { DISCORD_URL, TWITTER_URL } from "../links";

export function SeasonInactiveModal() {
  const [isOpen, setIsOpen] = useState(false);

  const now = useCurrentTime();
  const { isSeasonActive, seasonStart } = useSeasonTimes();
  const seasonName = useSeasonName();

  useEffect(() => {
    setIsOpen(!isSeasonActive);
  }, [isSeasonActive]);

  const title = seasonStart.diffNow().toMillis() < 0 ? `${seasonName} has ended` : `${seasonName} starting soon:`;
  const timeUntilSeasonStart = seasonStart.diff(now);

  return (
    <Modal title={title} isOpen={isOpen} setOpen={setIsOpen}>
      <div className="text-center text-ss-text-default">
        <p>Sky Strife is unavailable for play until a new Season starts.</p>
        {seasonStart.diffNow().toMillis() > 0 && (
          <p className="font-bold text-2xl">
            {seasonName} starts in:{" "}
            <span className="font-mono text-ss-text-link">{timeUntilSeasonStart.toFormat("dd:hh:mm:ss")}</span>
          </p>
        )}

        <div className="h-4" />

        <Body>
          Follow along on{" "}
          <Link style={{ fontSize: "16px" }} href={DISCORD_URL}>
            Discord
          </Link>{" "}
          and{" "}
          <Link style={{ fontSize: "16px" }} href={TWITTER_URL}>
            Twitter
          </Link>{" "}
          for more information on the next Season!
        </Body>

        <div className="h-8" />
      </div>
    </Modal>
  );
}
