import { MUDChain, mudFoundry, redstone as mudRedstone } from "@latticexyz/common/chains";
import { parseGwei } from "viem";

export type SkyStrifeChain = MUDChain & {
  indexerUrl?: string;
  matchIndexerUrl?: string;
  bridgeUrl?: string;
};

export const garnet = {
  id: 17069,
  name: "Redstone Garnet Testnet",
  network: "garnet",
  summary: {
    location: "Holesky",
  },
  description: "Redstone Garnet Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Holesky Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.garnet.qry.live"],
      webSocket: ["wss://rpc.garnet.qry.live"],
    },
    public: {
      http: ["https://rpc.garnet.qry.live"],
      webSocket: ["wss://rpc.garnet.qry.live"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.garnet.qry.live",
    },
  },
  fees: {
    baseFeeMultiplier: 1.2,
    defaultPriorityFee: parseGwei("0.001"),
  },
  indexerUrl: "https://indexer.mud.garnetchain.com",
};

export const redstone = {
  ...mudRedstone,
  indexerUrl: "https://dozer.mud.redstonechain.com/",
  matchIndexerUrl: "https://skystrife-indexer-api.onrender.com/",
  bridgeUrl: "https://race.redstone.xyz/deposit",
};

// If you are deploying to chains other than anvil or Lattice testnet, add them here
export const supportedChains: SkyStrifeChain[] = [mudFoundry, garnet, redstone];
