import { useEffect } from "react";
import { useStore } from "../useStore";
import { useNetworkLayer } from "./useNetworkLayer";
import { AmalgemaUIRoot } from "./amalgema-ui/AmalgemaUIRoot";
import { LoadingScreen } from "./amalgema-ui/LoadingScreen";
import { WagmiConfig, configureChains, createConfig, mainnet } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { publicProvider } from "wagmi/providers/public";
import { Link } from "./ui/Theme/SkyStrife/Typography";
import { DISCORD_URL } from "./links";
import { SEASON_NAME } from "../constants";

// Default config setup
const { publicClient } = configureChains([mainnet], [publicProvider()]);
const wagmiConfig = createConfig({
  publicClient,
});

export const Amalgema = () => {
  const LOCK_CLIENT = false;

  return LOCK_CLIENT ? <AmalgemaLockScreen /> : <AmalgemaMenu />;
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
      <div className="text-4xl font-bold">Sky Strife is in maintenance mode.</div>
      <div className="h-3" />
      <div className="text-xl text-ss-text-light text-center">
        {/* <span className="font-bold">{SEASON_NAME} starts on February 6th, 2024</span> */}

        <div>
          Follow along on{" "}
          <Link style={{ fontSize: "18px" }} href={DISCORD_URL}>
            Discord
          </Link>{" "}
          for more updates
        </div>
      </div>
    </div>
  );
};
