import { twMerge } from "tailwind-merge";
import { Caption, Link, OverlineLarge } from "../ui/Theme/SkyStrife/Typography";
import { useCurrentMatchReward } from "./hooks/useCurrentMatchReward";
import { Mana } from "../ui/Theme/SkyStrife/Mana";
import { MUD_URL } from "../links";
import { NetworkStatus } from "./NetworkStatus";

export function Header() {
  const matchReward = useCurrentMatchReward();

  return (
    <div
      className={twMerge(
        "bg-ss-bg-1 border-b border-ss-stroke z-50 px-8 py-4 flex flex-row justify-between items-center"
      )}
    >
      <div className="flex flex-row justify-between w-full h-full">
        <div className="flex flex-row">
          <OverlineLarge className="normal-case h-[32px]" style={{ fontSize: "32px" }}>
            Sky Strife
          </OverlineLarge>

          <Caption className="ml-4">
            powered by <Link href={MUD_URL}>MUD</Link>
          </Caption>
        </div>

        <div className="flex flex-row">
          <Caption className="flex flex-row items-center">
            current match reward: &nbsp; <Mana amount={matchReward} />
          </Caption>

          <NetworkStatus />
        </div>
      </div>
    </div>
  );
}
