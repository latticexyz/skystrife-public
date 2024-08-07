import { MUDChain, mudFoundry, redstone as mudRedstone } from "@latticexyz/common/chains";
import { chainConfig } from "viem/op-stack";

export type SkyStrifeChain = MUDChain & {
  indexerUrl?: string;
  matchIndexerUrl?: string;
  bridgeUrl?: string;
};

const sourceId = 17000;
export const garnet = {
  ...chainConfig,
  id: 17069,
  sourceId,
  name: "Garnet Holesky",
  testnet: true,
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.garnetchain.com"],
      webSocket: ["wss://rpc.garnetchain.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.garnetchain.com",
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
    },
    portal: {
      [sourceId]: {
        address: "0x57ee40586fbE286AfC75E67cb69511A6D9aF5909",
        blockCreated: 1274684,
      },
    },
    l2OutputOracle: {
      [sourceId]: {
        address: "0xCb8E7AC561b8EF04F2a15865e9fbc0766FEF569B",
        blockCreated: 1274684,
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: "0x09bcDd311FE398F80a78BE37E489f5D440DB95DE",
        blockCreated: 1274684,
      },
    },
  },
  iconUrls: ["https://redstone.xyz/chain-icons/garnet.png"],
  indexerUrl: "https://indexer.mud.garnetchain.com",
  matchIndexerUrl: "https://garnet.dozer.skystrife.xyz",
  faucetUrl: "https://garnetchain.com/faucet",
} as const satisfies SkyStrifeChain;

export const redstone = {
  ...mudRedstone,
  indexerUrl: "https://redstone2.dozer.skystrife.xyz/",
  matchIndexerUrl: "https://redstone2.dozer.skystrife.xyz/",
  bridgeUrl: "https://race.redstone.xyz/deposit",
};

// If you are deploying to chains other than anvil or Lattice testnet, add them here
export const supportedChains: SkyStrifeChain[] = [mudFoundry, garnet, redstone];
