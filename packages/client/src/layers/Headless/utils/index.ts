import { Hex } from "viem";

export * from "./combat";

export const formatAddress = (address: Hex) => address.slice(0, 6) + "..." + address.slice(-4);
