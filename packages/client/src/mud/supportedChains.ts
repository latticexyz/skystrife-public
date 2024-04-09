import { MUDChain, mudFoundry } from "@latticexyz/common/chains";

type SkyStrifeChain = MUDChain & {
  indexerUrl?: string;
};

export const redstoneGarnet = {
  id: 17069,
  name: "Redstone Garnet Testnet",
  network: "redstone-garnet",
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
      webSocket: ["https://rpc.garnet.qry.live"],
    },
    public: {
      http: ["https://rpc.garnet.qry.live"],
      webSocket: ["https://rpc.garnet.qry.live"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.garnet.qry.live",
    },
  },
};

// If you are deploying to chains other than anvil or Lattice testnet, add them here
export const supportedChains: SkyStrifeChain[] = [mudFoundry, redstoneGarnet];
