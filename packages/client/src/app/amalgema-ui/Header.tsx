import { twMerge } from "tailwind-merge";
import { Caption, Link, OverlineLarge } from "../ui/Theme/SkyStrife/Typography";
import { MUD_URL } from "../links";
import { NetworkStatus } from "./NetworkStatus";
import { AnnouncementModal } from "./AnnouncementModal";

export function Header() {
  return (
    <div
      className={twMerge(
        "bg-ss-bg-1 border-b border-ss-stroke z-20 px-8 py-4 flex flex-row justify-between items-center",
      )}
    >
      <div className="flex flex-row justify-between w-full h-full items-center">
        <div className="flex flex-row items-center">
          <OverlineLarge className="normal-case h-[32px]" style={{ fontSize: "32px" }}>
            Sky Strife
          </OverlineLarge>

          <Caption className="ml-4">
            powered by <Link href={MUD_URL}>MUD</Link>
          </Caption>
        </div>

        <AnnouncementModal />

        <NetworkStatus />
      </div>
    </div>
  );
}
