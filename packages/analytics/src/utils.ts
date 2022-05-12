import worldsJson from "contracts/worlds.json";

export const LIVE_WORLDS = worldsJson as Partial<Record<string, { address: string; blockNumber?: number }>>;

export const getWorldFromChainId = (chainId: number) => {
  return LIVE_WORLDS[chainId.toString()];
};
