import { Wallet } from "ethers";
import { getChain, getWorldFromChainId } from "./utils";
import { Entity } from "@latticexyz/recs";

export const getBurnerWallet = () => {
  const params = new URLSearchParams(window.location.search);

  const manualPrivateKey = params.get("privateKey");
  if (manualPrivateKey) return new Wallet(manualPrivateKey).privateKey;

  const useAnvilAdminKey = import.meta.env.DEV && !params.has("asPlayer");
  if (useAnvilAdminKey) {
    // default anvil admin key
    return "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  }

  const storageKey = "mud:burnerWallet";

  const privateKey = localStorage.getItem(storageKey);
  if (privateKey) return privateKey;

  const burnerWallet = Wallet.createRandom();
  localStorage.setItem(storageKey, burnerWallet.privateKey);
  return burnerWallet.privateKey;
};

/**
 * Uses URL params and chain config to determine the network settings for the client.
 * Supported URL params:
 *
 * Network/Sync Info:
 * - chainId(number): The ID of the chain you want to connect to. Currently supports 31337 (localhost) and 17001 (Redstone Holesky) natively. To add more chains, see `supportedChains.ts`.
 * - worldAddress(string): The address of the world contract.
 * - initialBlockNumber(number): The initial block number to start syncing from.
 * - disableIndexer(boolean): Whether to disable the indexer.
 * - rpc(string): The JSON-RPC URL.
 * - wsRpc(string): The WebSocket JSON-RPC URL.
 * - faucet(string): The faucet service URL.
 * - privateKey(string): The private key to use for the burner wallet.
 *
 * Sky Strife Specific:
 * - anon(boolean): If true, will generate a new burner wallet ON EVERY PAGE LOAD.
 * - match(string): The entity ID for a specific Sky Strife match. Should be used alongside the /match route.
 * - useBurner(boolean): Use the in-memory burner wallet for all actions instead of the external wallet (i.e. Metamask). This is the default behavior in DEV mode.
 *
 * Dev Only:
 * - useExternalWallet(boolean): Force the use of an external wallet.
 * - asPlayer(boolean): Force the generation of a non-admin burner wallet.
 */
export function getNetworkConfig() {
  const params = new URLSearchParams(window.location.search);

  const chainId = Number(params.get("chainId") || import.meta.env.VITE_CHAIN_ID || 31337);
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

  const useBurner = (import.meta.env.DEV && !params.has("useExternalWallet")) || params.has("useBurner");
  const burnerWalletPrivateKey = params.has("anon") ? Wallet.createRandom().privateKey : getBurnerWallet();

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
    privateKey: burnerWalletPrivateKey,
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
