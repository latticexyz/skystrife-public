import { useEffect } from "react";
import { useStore } from "../useStore";
import { useNetworkLayer } from "./useNetworkLayer";
import { WagmiConfig, configureChains, createConfig, mainnet } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { publicProvider } from "wagmi/providers/public";
import { AdminUIRoot } from "./ui/AdminUIRoot";
import { LoadingScreen } from "./amalgema-ui/LoadingScreen";

// Default config setup
const { publicClient } = configureChains([mainnet], [publicProvider()]);
const wagmiConfig = createConfig({
  publicClient,
});

export const Admin = () => {
  const networkLayer = useNetworkLayer();

  useEffect(() => {
    if (networkLayer) {
      useStore.setState({ networkLayer });
    }
  }, [networkLayer]);

  return (
    <WagmiConfig config={networkLayer ? networkLayer.network.wagmiConfig : wagmiConfig}>
      <RainbowKitProvider chains={networkLayer ? networkLayer.network.chains : []}>
        <LoadingScreen networkLayer={networkLayer} />

        <AdminUIRoot />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};
