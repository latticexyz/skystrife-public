import { SkyStrifeChain } from "client/src/mud/supportedChains";
import { mudFoundry } from "@latticexyz/common/chains";
import { execa, execaSync } from "execa";

export async function runWorldScript(
  chain: SkyStrifeChain,
  name: string,
  path: string,
  address: string,
  broadcast: boolean,
) {
  const { stdout: gasPriceOutput } = execaSync("cast", ["gas-price", "--rpc-url", chain.rpcUrls.default.http[0]]);
  const gasPrice = parseInt(gasPriceOutput);

  if (isNaN(gasPrice)) {
    throw new Error("Failed to get gas price");
  }
  console.log(`Gas price: ${gasPrice}`);

  const scriptProcess = execa(
    "forge",
    [
      "script",
      ...(broadcast ? ["--broadcast"] : []),
      "--with-gas-price",
      gasPrice.toString(),
      "--sig",
      "run(address)",
      "--rpc-url",
      chain.rpcUrls.default.http[0],
      `${path}:${name}`,
      address,
    ],
    {
      env: {
        PRIVATE_KEY: mudFoundry?.id ? "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" : "",
      },
    },
  );

  console.log(`Running ${path}:${name}... with world address ${address}`);

  await scriptProcess;
  if (scriptProcess.exitCode === 0) {
    console.log(`Successfully executed ${name}! ${broadcast ? "Txs were broadcasted" : "Simulation only."}`);
  } else {
    throw new Error("Script execution failed!");
  }
}
