import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { GetContractReturnType, PublicClient, Transport, Chain, WalletClient, Address } from "viem";
import { create } from "zustand";
import { HeadlessLayer } from "./layers/Headless";
import { LocalLayer } from "./layers/Local";
import { NetworkLayer } from "./layers/Network";
import { PhaserLayer } from "./layers/Renderer/Phaser";
import { Config } from "wagmi";

export type ContractType = GetContractReturnType<typeof IWorldAbi, PublicClient<Transport, Chain>, Address>;

export type Store = {
  networkLayer: NetworkLayer | null;
  headlessLayer: HeadlessLayer | null;
  localLayer: LocalLayer | null;
  phaserLayer: PhaserLayer | null;
  wagmiConfig: Config | null;
  externalWalletClient: WalletClient | null;
  externalWorldContract: ContractType | null;
  loadingPageHidden: boolean;
};

export const useStore = create<Store>(() => ({
  networkLayer: null,
  headlessLayer: null,
  localLayer: null,
  phaserLayer: null,
  wagmiConfig: null,
  externalWalletClient: null,
  externalWorldContract: null,
  loadingPageHidden: false,
}));
