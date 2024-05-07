import { Link } from "./ui/Theme/SkyStrife/Typography";
import { DISCORD_URL } from "./links";

import { useEffect } from "react";
import { useStore } from "../useStore";
import { LoadingScreen } from "./amalgema-ui/LoadingScreen";
import { AmalgemaUIRoot } from "./amalgema-ui/AmalgemaUIRoot";

export const Amalgema = () => {
  const LOCK_CLIENT = false;

  useEffect(() => {
    document.title = `Sky Strife - Main Menu`;
  }, []);

  if (LOCK_CLIENT) {
    return <LockScreen />;
  }

  return <AmalgemaMenu />;
};

const AmalgemaMenu = () => {
  const networkLayer = useStore((state) => state.networkLayer);

  return (
    <div>
      <LoadingScreen networkLayer={networkLayer} />
      <AmalgemaUIRoot />
    </div>
  );
};

const LockScreen = () => {
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
        <span className="text-3xl text-ss-text-link">
          Sky Strife is experienceing downtime. We will be back as soon as possible.
        </span>
        <div className="h-6" />
        <div>
          Follow along on{" "}
          <Link style={{ fontSize: "18px" }} href={DISCORD_URL}>
            Discord
          </Link>{" "}
          for more details.
        </div>
      </div>
    </div>
  );
};
