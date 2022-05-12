import { useStore } from "./useStore";

export const useAmalgema = () => {
  const { networkLayer, externalWalletClient, externalWorldContract, writes } = useStore();

  if (networkLayer === null) {
    throw new Error("Network layer not initialized");
  }

  return { ...networkLayer, externalWalletClient, externalWorldContract, writes };
};
