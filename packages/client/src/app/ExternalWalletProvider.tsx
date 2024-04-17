import { transportObserver } from "@latticexyz/common";
import { transactionQueue, writeObserver } from "@latticexyz/common/actions";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { useEffect } from "react";
import { createPublicClient, fallback, webSocket, http, getContract, Hex } from "viem";
import { useWalletClient } from "wagmi";
import { NetworkConfig } from "../mud/utils";
import { useStore } from "../useStore";

export type Props = {
  networkConfig: NetworkConfig;
  children: React.ReactNode;
};

export function ExternalWalletProvider({ networkConfig, children }: Props) {
  const { data: externalWalletClient } = useWalletClient();
  useEffect(() => {
    if (networkConfig.useBurner) return;

    if (!externalWalletClient) {
      useStore.setState({ externalWalletClient: null, externalWorldContract: null });
      return;
    }

    const customExternalWalletClient = externalWalletClient.extend(transactionQueue()).extend(
      writeObserver({
        onWrite: (write) => {
          const { writes } = useStore.getState();
          useStore.setState({ writes: [...writes, write] });
        },
      }),
    );

    // TODO: centralize this somewhere
    const publicClient = createPublicClient({
      chain: networkConfig.chain,
      transport: transportObserver(fallback([webSocket(), http()], { retryCount: 0 })),
      pollingInterval: 250,
    });

    const externalWorldContract = getContract({
      address: networkConfig.worldAddress as Hex,
      abi: IWorldAbi,
      client: {
        public: publicClient,
        wallet: customExternalWalletClient,
      },
    });

    useStore.setState({ externalWalletClient: customExternalWalletClient, externalWorldContract });
  }, [externalWalletClient, networkConfig.chain, networkConfig.useBurner, networkConfig.worldAddress]);

  return children;
}
