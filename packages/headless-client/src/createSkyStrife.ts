import { z } from "zod";
import { NetworkLayer, createNetworkLayer } from "client/src/layers/Network/";
import { createNetworkConfig } from "./createNetworkConfig";
import { SyncStep } from "@latticexyz/store-sync";
import { filter, firstValueFrom, take } from "rxjs";
import { Wallet } from "ethers";
import { createBurnerAccount, transportObserver } from "@latticexyz/common";
import {
  createPublicClient,
  fallback,
  webSocket,
  http,
  createWalletClient,
  Hex,
  ClientConfig,
  stringToHex,
  GetContractReturnType,
  PublicClient,
  Transport,
  Chain,
  WalletClient,
  Account,
  Address,
  isHex,
  pad,
  getContract,
} from "viem";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { HeadlessLayer, createHeadlessLayer } from "client/src/layers/Headless";
import { Entity } from "@latticexyz/recs";

export const env = z
  .object({
    CHAIN_ID: z.coerce.number().positive(),
    PRIVATE_KEY: z
      .string()
      .optional()
      .transform((val) => (val ? (isHex(val) ? val : stringToHex(val, { size: 64 })) : undefined)),
    DISABLE_INDEXER: z
      .string()
      .optional()
      .transform((val) => (val ? val === "true" : undefined)),
    LEVEL_ID: z.string().optional(),
    MATCH_ENTITY: z.string().optional(),
  })
  .parse(process.env, {
    errorMap: (issue) => ({
      message: `Missing or invalid environment variable: ${issue.path.join(".")}`,
    }),
  });

export type SkyStrife = Awaited<ReturnType<typeof createSkyStrife>>;

export async function createSkyStrife(): Promise<{
  networkLayer: NetworkLayer;
  headlessLayer: HeadlessLayer;
  createPlayer: (privateKey?: Hex) => {
    worldContract: GetContractReturnType<typeof IWorldAbi, PublicClient<Transport, Chain>, Address>;
    walletClient: ReturnType<typeof createWalletClient>;
    address: Hex;
    entity: Hex;
  };
}> {
  const networkConfig = createNetworkConfig(env.CHAIN_ID, {
    disableIndexer: env.DISABLE_INDEXER,
    matchEntity: env.MATCH_ENTITY as Entity | undefined,
  });

  console.log(`Connecting to ${networkConfig.chain.name}...`);
  if (env.MATCH_ENTITY) {
    console.log(`Loading Match: ${env.MATCH_ENTITY}`);
  }

  const networkLayer = await createNetworkLayer(networkConfig);
  const headlessLayer = await createHeadlessLayer(networkLayer);

  const {
    components: { SyncProgress },
  } = networkLayer;

  async function waitForSync() {
    const live$ = SyncProgress.update$.pipe(
      filter((progress) => {
        const [val] = progress.value;

        if (val) {
          console.log(val.message);
        }

        return val?.step === SyncStep.LIVE;
      }),
      take(1)
    );

    return firstValueFrom(live$);
  }

  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(fallback([webSocket(), http()], { retryCount: 0 })),
    pollingInterval: 1000,
  } as const satisfies ClientConfig;

  const publicClient = createPublicClient(clientOptions);

  function createPlayer(privateKey?: Hex) {
    if (!privateKey) {
      privateKey = Wallet.createRandom().privateKey as Hex;
    }

    const burnerAccount = createBurnerAccount(privateKey);
    const burnerWalletClient = createWalletClient({
      ...clientOptions,
      account: burnerAccount,
    });

    const worldContract = getContract({
      address: networkConfig.worldAddress as Hex,
      abi: IWorldAbi,
      client: {
        public: publicClient,
        wallet: burnerWalletClient,
      },
    });

    return {
      worldContract,
      walletClient: burnerWalletClient,
      address: burnerAccount.address,
      entity: pad(burnerAccount.address, { size: 32 }).toLowerCase() as Hex,
    };
  }

  console.log("Waiting for sync...");
  await waitForSync();
  console.log("Synced!");

  return {
    networkLayer,
    headlessLayer,
    createPlayer,
  };
}
