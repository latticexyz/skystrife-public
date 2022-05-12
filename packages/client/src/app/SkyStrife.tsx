import { useEffect } from "react";
import { useStore } from "../useStore";
import { HeadlessLayer } from "./HeadlessLayer";
import { UIRoot } from "./ui/UIRoot";
import { useNetworkLayer } from "./useNetworkLayer";
import { WagmiConfig, configureChains, createConfig, mainnet } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { publicProvider } from "wagmi/providers/public";
import { LoadingScreen } from "./amalgema-ui/LoadingScreen";

// Default config setup
const { publicClient } = configureChains([mainnet], [publicProvider()]);
const wagmiConfig = createConfig({
  publicClient,
});

export const SkyStrife = () => {
  const networkLayer = useNetworkLayer();

  useEffect(() => {
    if (networkLayer) {
      useStore.setState({ networkLayer });
    }
  }, [networkLayer]);

  return (
    <WagmiConfig config={networkLayer ? networkLayer.network.wagmiConfig : wagmiConfig}>
      <RainbowKitProvider chains={networkLayer ? networkLayer.network.chains : []}>
        <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
          <LoadingScreen networkLayer={networkLayer} usePrepTime={true} />

          <UIRoot />

          <HeadlessLayer networkLayer={networkLayer} />
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  );
};
