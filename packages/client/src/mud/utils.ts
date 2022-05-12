import worldsJson from "contracts/worlds.json";
import { supportedChains } from "./supportedChains";
import { getNetworkConfig } from "./getBrowserNetworkConfig";

export type NetworkConfig = Awaited<ReturnType<typeof getNetworkConfig>>;

export const LIVE_WORLDS = worldsJson as Partial<Record<string, { address: string; blockNumber?: number }>>;

export const getWorldFromChainId = (chainId: number) => {
  return LIVE_WORLDS[chainId.toString()];
};

export const getChain = (chainId: number) => {
  const chainIndex = supportedChains.findIndex((c) => c.id === chainId);
  const chain = supportedChains[chainIndex];

  if (!chain) {
    throw new Error(`Chain ${chainId} not supported`);
  }

  return chain;
};
