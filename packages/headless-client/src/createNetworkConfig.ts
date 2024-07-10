import { NetworkConfig, getChain, getWorldFromChainId } from "client/src/mud/utils";
import { Entity } from "@latticexyz/recs";

export function createNetworkConfig(
  chainId: number,
  {
    disableIndexer,
    matchEntity,
    privateKey,
  }: {
    disableIndexer?: boolean;
    matchEntity?: Entity;
    privateKey?: string;
  } = {},
): NetworkConfig {
  const chain = getChain(chainId);
  const world = getWorldFromChainId(chain.id);
  const worldAddress = world?.address;
  if (!worldAddress) {
    throw new Error(`No world address found for chain ${chainId}. Did you run \`mud deploy\`?`);
  }

  const initialBlockNumber = world?.blockNumber ?? -1;

  let indexerUrl = chain.indexerUrl;
  if (disableIndexer) indexerUrl = undefined;

  return {
    clock: {
      period: 1000,
      initialTime: 0,
      syncInterval: 5000,
    },
    provider: {
      chainId,
      jsonRpcUrl: chain.rpcUrls.default.http[0],
      wsRpcUrl: chain.rpcUrls.default.webSocket?.[0],
    },
    privateKey: privateKey || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    chainId,
    faucetServiceUrl: chain.faucetUrl,
    worldAddress,
    initialBlockNumber,
    disableCache: true,
    matchEntity: matchEntity ?? null,
    chain,
    indexerUrl,
    useBurner: false,
  };
}
