import { createClientComponents } from "./createClientComponents";
import { setupNetwork } from "./setupNetwork";
import { NetworkConfig } from "./utils";

export type SetupResult = Awaited<ReturnType<typeof setup>>;

export async function setup(config: NetworkConfig) {
  const network = await setupNetwork(config);
  const components = createClientComponents(network);
  return {
    network,
    components,
  };
}
