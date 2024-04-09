import { world } from "./world";
import mudConfig from "contracts/mud.config";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { getContract } from "viem";
import { ContractWrite, createBurnerAccount, transportObserver } from "@latticexyz/common";
import { encodeEntity, syncToRecs } from "@latticexyz/store-sync/recs";
import { map, filter, Subject, share } from "rxjs";
import { useStore } from "../useStore";
import { NetworkConfig } from "./utils";
import { createClock } from "./createClock";
import { createPublicClient, fallback, webSocket, http, createWalletClient, Hex, ClientConfig, custom } from "viem";
import { transactionQueue, writeObserver } from "@latticexyz/common/actions";
import { createWaitForTransaction } from "./waitForTransaction";
import { createSyncFilters } from "./createSyncFilters";
import { tables as extraTables, syncFilters as extraSyncFilters } from "./extraTables";

export const addressToEntityID = (address: Hex) => encodeEntity({ address: "address" }, { address });

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;

export async function setupNetwork(networkConfig: NetworkConfig) {
  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(fallback([webSocket(), http()], { retryCount: 0 })),
    pollingInterval: 250,
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
    pollingInterval: 250,
  });

  const waitForTransaction = createWaitForTransaction({
    storedBlockLogs$,
    client: txReceiptClient,
  });

  // time it takes to receive events from a sent tx
  let meanResponseTime = 2000;
  const updateMeanResponseTime = (newResponseTime: number) => {
    meanResponseTime = newResponseTime;
  };
  const getMeanResponseTime = () => meanResponseTime;

  latestBlock$
    .pipe(
      map((block) => {
        // accelerate the player's clock to compensate for the time it
        // takes for their tx to be included in a block. this has the
        // effect of making the beginnings of turns feel more responsive
        // as you can "pre-send" your txs to arrive at the start of the
        // next turn. this will hopefully alleviate the latency advantage
        // at the beginning of turns.
        // unfortunately, we can only change the player's clock by whole seconds
        // because that is the granularity of the block timestamps.
        // in my manual testing 2 second acceleration was possible with a response time
        // around 3600 ms.
        const clientTimeAhead = Math.ceil(getMeanResponseTime() / 2 / 1000) * 1000;
        return Number(block.timestamp) * 1000 + clientTimeAhead;
      }), // Map to timestamp in ms
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
  const txQueue = transactionQueue({
    queueConcurrency: 3,
  });
  const onWrite = (write: ContractWrite) => {
    write$.next(write);
    const { writes } = useStore.getState();
    useStore.setState({ writes: [...writes, write] });
  };
  const customWalletClient = walletClient.extend(txQueue).extend(writeObserver({ onWrite }));

  const worldContract = getContract({
    address: networkConfig.worldAddress as Hex,
    abi: IWorldAbi,
    client: { public: publicClient, wallet: customWalletClient },
  });

  // If flag is set, use the burner key as the "External" wallet
  if (networkConfig.useBurner) {
    const externalWalletClient = customWalletClient;
    const externalWorldContract = worldContract;

    useStore.setState({ externalWalletClient, externalWorldContract });
  }

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
    write$: write$.asObservable().pipe(share()),
    latestBlock$,
    storedBlockLogs$,
    chains: [networkConfig.chain],
    responseTime: {
      updateMeanResponseTime,
      getMeanResponseTime,
    },
  };
}
