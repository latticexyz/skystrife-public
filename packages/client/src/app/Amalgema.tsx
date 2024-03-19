import { useEffect, useState } from "react";
import { useStore } from "../useStore";
import { useNetworkLayer } from "./useNetworkLayer";
import { AmalgemaUIRoot } from "./amalgema-ui/AmalgemaUIRoot";
import { LoadingScreen } from "./amalgema-ui/LoadingScreen";
import { WagmiConfig, configureChains, createConfig, mainnet } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { publicProvider } from "wagmi/providers/public";
import { Link } from "./ui/Theme/SkyStrife/Typography";
import { DISCORD_URL } from "./links";
import { SEASON_NAME, SEASON_START } from "../constants";
import { DateTime } from "luxon";
import { useCurrentTime } from "./amalgema-ui/hooks/useCurrentTime";
import { Button } from "./ui/Theme/SkyStrife/Button";

// Default config setup
const { publicClient } = configureChains([mainnet], [publicProvider()]);
const wagmiConfig = createConfig({
  publicClient,
});

export const Amalgema = () => {
  const LOCK_CLIENT = true;

  const now = DateTime.now().toSeconds();
  if (LOCK_CLIENT && now < SEASON_START) {
    return <AmalgemaLockScreen />;
  }

  return <AmalgemaMenu />;
};

const AmalgemaMenu = () => {
  const networkLayer = useNetworkLayer();

  useEffect(() => {
    if (networkLayer) {
      useStore.setState({ networkLayer });
      document.title = `Sky Strife - Main Menu`;
    }
  }, [networkLayer]);

  return (
    <WagmiConfig config={networkLayer ? networkLayer.network.wagmiConfig : wagmiConfig}>
      <RainbowKitProvider chains={networkLayer ? networkLayer.network.chains : []}>
        <div>
          <LoadingScreen networkLayer={networkLayer} />

          <AmalgemaUIRoot />
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

const AmalgemaLockScreen = () => {
  const seasonStartTime = DateTime.fromSeconds(SEASON_START);
  const [durationUntilSeasonStart, setDurationUntilSeasonStart] = useState(
    seasonStartTime.diffNow(["days", "hours", "minutes", "seconds"])
  );

  const now = useCurrentTime();
  useEffect(() => {
    setDurationUntilSeasonStart(seasonStartTime.diff(now, ["days", "hours", "minutes", "seconds"]));
  }, [now]);

  const { days, hours, minutes, seconds } = durationUntilSeasonStart;

  function pluralize(n: number, unit: string) {
    return `${n} ${unit}${n === 1 ? "" : "s"}`;
  }

  const timeLeftMessage = `${pluralize(days, "day")}, ${pluralize(hours, "hour")}, ${pluralize(
    minutes,
    "minute"
  )}, and ${pluralize(Math.floor(seconds), "second")}`;
  const countdown = (
    <span className="text-3xl text-ss-text-link">
      {SEASON_NAME} starts in:
      <br />
      <span className="text-4xl font-bold text-black">{timeLeftMessage}</span>
    </span>
  );
  const reloadButton = (
    <>
      <div className="text-3xl text-ss-text-link">{SEASON_NAME} starts now!</div>
      <div className="h-6" />
      <Button buttonType="primary" className="text-2xl p-4" onClick={() => window.location.reload()}>
        Reload to Join
      </Button>
    </>
  );

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <div
        style={{
          background:
            "linear-gradient(152deg, rgba(244, 243, 241, 0.98) 0%, rgba(244, 243, 241, 0.88) 100%), url(/assets/ship-background.jpeg), lightgray -381.491px 0.145px / 126.42% 100% no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "right",
          zIndex: -2,
        }}
        className="fixed top-0 left-0 h-screen w-screen bg-cover"
      />
      <div className="h-2" />
      <div className="text-xl text-ss-text-default text-center mt-3">
        {now.toSeconds() < SEASON_START ? countdown : reloadButton}
        <div className="h-6" />
        <div>
          Follow along on{" "}
          <Link style={{ fontSize: "18px" }} href={DISCORD_URL}>
            Discord
          </Link>{" "}
          for more updates.
        </div>
      </div>
    </div>
  );
};
