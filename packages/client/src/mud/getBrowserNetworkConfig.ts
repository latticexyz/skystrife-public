import { getBurnerWallet } from "../getBurnerWallet";
import { Wallet } from "ethers";
import { getChain, getWorldFromChainId } from "./utils";
import { Entity } from "@latticexyz/recs";
import { redstoneHolesky } from "./supportedChains";

export async function getNetworkConfig() {
  const params = new URLSearchParams(window.location.search);

  const chainId = Number(params.get("chainId") || (import.meta.env.DEV ? 31337 : redstoneHolesky.id));
  const chain = getChain(chainId);

  const world = getWorldFromChainId(chain.id);
  const worldAddress = params.get("worldAddress") || world?.address;
  if (!worldAddress) {
    throw new Error(`No world address found for chain ${chainId}. Did you run \`mud deploy\`?`);
  }

  const initialBlockNumber = params.has("initialBlockNumber")
    ? Number(params.get("initialBlockNumber"))
    : world?.blockNumber ?? -1; // -1 will attempt to find the block number from RPC

  let indexerUrl = chain.indexerUrl;
  if (params.has("disableIndexer")) indexerUrl = undefined;

  // TODO: validate match entity param is hex and the shape of hex we expect
  const matchParam = params.get("match");
  const matchEntity = matchParam != null ? (matchParam as Entity) : null;

  const useBurner = (import.meta.env.DEV && !params.has("externalWallet")) || params.has("useBurner");

  return {
    clock: {
      period: 1000,
      initialTime: 0,
      syncInterval: 2000,
    },
    provider: {
      chainId,
      jsonRpcUrl: params.get("rpc") ?? chain.rpcUrls.default.http[0],
      wsRpcUrl: params.get("wsRpc") ?? chain.rpcUrls.default.webSocket?.[0],
    },
    privateKey: params.has("anon") ? Wallet.createRandom().privateKey : getBurnerWallet(),
    useBurner,
    chainId,
    faucetServiceUrl: params.get("faucet") ?? chain.faucetUrl,
    worldAddress,
    initialBlockNumber,
    disableCache: import.meta.env.PROD,
    matchEntity,
    chain,
    indexerUrl,
  };
}
