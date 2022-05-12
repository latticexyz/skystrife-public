import { world } from "./world";
import mudConfig from "contracts/mud.config";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { ContractWrite, createBurnerAccount, getContract, transportObserver } from "@latticexyz/common";
import { encodeEntity, syncToRecs } from "@latticexyz/store-sync/recs";
import { map, filter, Subject, share } from "rxjs";
import { useStore } from "../useStore";
import { toAccount } from "viem/accounts";
import { NetworkConfig } from "./utils";
import { createClock } from "./createClock";
import { createPublicClient, fallback, webSocket, http, createWalletClient, Hex, ClientConfig, custom } from "viem";
import { WindowProvider, configureChains, createConfig } from "wagmi";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { publicProvider } from "wagmi/providers/public";
import { createWaitForTransaction } from "./waitForTransaction";
import { createSyncFilters } from "./createSyncFilters";
import { tables as extraTables, syncFilters as extraSyncFilters } from "./extraTables";

export const addressToEntityID = (address: Hex) => encodeEntity({ address: "address" }, { address });

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;

export async function setupNetwork(networkConfig: NetworkConfig) {
  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(fallback([webSocket(), http()], { retryCount: 0 })),
    pollingInterval: 1000,
  } as const satisfies ClientConfig;

  const publicClient = createPublicClient(clientOptions);

  const filters = [...createSyncFilters(networkConfig.matchEntity), ...extraSyncFilters];

  const { components, latestBlock$, storedBlockLogs$ } = await syncToRecs({
    world,
    config: mudConfig,
    address: networkConfig.worldAddress as Hex,
    publicClient,
    indexerUrl: networkConfig.indexerUrl,
    startBlock: networkConfig.initialBlockNumber > 0n ? BigInt(networkConfig.initialBlockNumber) : undefined,
    filters,
    tables: extraTables,
  });

  const clock = createClock(networkConfig.clock);
  world.registerDisposer(() => clock.dispose());

  const txReceiptClient = createPublicClient({
    ...clientOptions,
    transport: http(),
  });

  const waitForTransaction = createWaitForTransaction({
    storedBlockLogs$,
    client: txReceiptClient,
  });

  latestBlock$
    .pipe(
      map((block) => Number(block.timestamp) * 1000), // Map to timestamp in ms
      filter((blockTimestamp) => blockTimestamp !== clock.lastUpdateTime), // Ignore if the clock was already refreshed with this block
      filter((blockTimestamp) => blockTimestamp !== clock.currentTime) // Ignore if the current local timestamp is correct
    )
    .subscribe(clock.update); // Update the local clock

  const burnerAccount = createBurnerAccount(networkConfig.privateKey as Hex);
  const walletClient = createWalletClient({
    ...clientOptions,
    account: burnerAccount,
  });

  const write$ = new Subject<ContractWrite>();
  const worldContract = getContract({
    address: networkConfig.worldAddress as Hex,
    abi: IWorldAbi,
    publicClient,
    walletClient,
    onWrite: (write) => {
      write$.next(write);
      const { writes } = useStore.getState();
      useStore.setState({ writes: [...writes, write] });
    },
  });

  const initialiseWallet = async (address: Hex | undefined) => {
    if (!networkConfig.useBurner) {
      if (address) {
        if (window.ethereum && window.ethereum.providers && window.ethereum.providers.length > 1) {
          const metamaskProvider = window.ethereum.providers.find((provider: WindowProvider) => provider.isMetaMask);
          if (metamaskProvider) window.ethereum = metamaskProvider;
        }

        if (!window.ethereum) {
          console.error("No ethereum provider found during wallet initialisation.");
          return;
        }

        const externalWalletClient = createWalletClient({
          chain: networkConfig.chain,
          transport: custom(window.ethereum),
          account: toAccount(address),
        });

        const externalWorldContract = getContract({
          address: networkConfig.worldAddress as Hex,
          abi: IWorldAbi,
          publicClient,
          walletClient: externalWalletClient,
          onWrite: (write) => {
            const { writes } = useStore.getState();
            useStore.setState({ writes: [...writes, write] });
          },
        });

        useStore.setState({ externalWalletClient, externalWorldContract });
      } else {
        useStore.setState({ externalWalletClient: null, externalWorldContract: null });
      }
    }
  };

  // If flag is set, use the burner key as the "External" wallet
  if (networkConfig.useBurner) {
    const externalWalletClient = walletClient;
    const externalWorldContract = worldContract;

    useStore.setState({ externalWalletClient, externalWorldContract });
  }

  const { chain } = publicClient;
  const chainCopy = { ...chain };
  if (chainCopy.fees) {
    delete chainCopy.fees; // Delete the BigInt property as it cannot be serialised by Wagmi
  }
  const { chains } = configureChains([chainCopy], [publicProvider()]);

  const connectors = connectorsForWallets([
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet({ projectId: "YOUR_PROJECT_ID", chains })],
    },
  ]);

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
  });

  return {
    world,
    components,
    playerEntity: encodeEntity({ address: "address" }, { address: walletClient.account.address }),
    publicClient,
    walletClient,
    waitForTransaction,
    worldContract,
    networkConfig,
    matchEntity: networkConfig.matchEntity,
    clock,
    initialiseWallet,
    write$: write$.asObservable().pipe(share()),
    latestBlock$,
    storedBlockLogs$,
    chains,
    wagmiConfig,
  };
}
