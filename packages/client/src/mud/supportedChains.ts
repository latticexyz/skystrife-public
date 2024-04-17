import { MUDChain, mudFoundry } from "@latticexyz/common/chains";

type SkyStrifeChain = MUDChain & {
  indexerUrl?: string;
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
};

export const redstone = {
  id: 690,
  name: "Redstone Mainnet",
  network: "redstone",
  summary: {
    location: "ETH Mainnet",
  },
  description: "Redstone Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.redstonechain.com"],
      webSocket: ["wss://rpc.redstonechain.com"],
    },
    public: {
      http: ["https://rpc.redstonechain.com"],
      webSocket: ["wss://rpc.redstonechain.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://api.explorer.redstonechain.com",
    },
  },
  indexerUrl: "https://indexer.skystrife.xyz",
};

// If you are deploying to chains other than anvil or Lattice testnet, add them here
export const supportedChains: SkyStrifeChain[] = [mudFoundry, garnet, redstone];
