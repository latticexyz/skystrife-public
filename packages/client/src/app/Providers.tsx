import { useEffect, useMemo } from "react";
import { useStore } from "../useStore";
import { useNetworkLayer } from "./useNetworkLayer";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { WagmiProvider, http } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { getNetworkConfig } from "../mud/getBrowserNetworkConfig";
import { ExternalWalletProvider } from "./ExternalWalletProvider";

export const queryClient = new QueryClient();

export type Props = {
  children: React.ReactNode;
};

export function Providers({ children }: Props) {
  const networkConfig = useMemo(() => getNetworkConfig(), []);
  const wagmiConfig = useMemo(
    () =>
      getDefaultConfig({
        appName: "Sky Strife",
        projectId: "57f814fbe33baeb0090e3917cf72064d",
        chains: [networkConfig.chain],
        transports: {
          [networkConfig.chain.id]: http(),
        },
      }),
    [networkConfig]
  );

  const networkLayer = useNetworkLayer(networkConfig);
  useEffect(() => {
    if (networkLayer) {
      useStore.setState({ networkLayer });
    }
  }, [networkLayer]);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ExternalWalletProvider networkConfig={networkConfig}>{children}</ExternalWalletProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
