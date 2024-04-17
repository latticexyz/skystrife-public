import prompts from "prompts";
import fs from "fs/promises";
import path from "path";
import { exec, execSync } from "child_process";
import { supportedChains } from "client/src/mud/supportedChains";
import worlds from "./worlds.json";

(async () => {
  const migrationsDir = path.join("./", "migrations");
  const filesInMigrationsDir = await fs.readdir(migrationsDir);

  // sort files by timestamp desc
  const migrationChoices = filesInMigrationsDir
    .sort((a, b) => {
      const aNum = parseInt(a.split("_")[0]);
      const bNum = parseInt(b.split("_")[0]);

      return bNum - aNum;
    })
    .map((migration) => ({
      title: migration,
      value: migration,
    }));

  const response = await prompts({
    type: "select",
    name: "migration",
    message: "Select a migration:",
    choices: migrationChoices,
    initial: 0,
  });

  const migrationName = response.migration;
  const contractName = migrationName.split("_")[1].split(".")[0];

  const foundryChain = supportedChains.find((chain) => chain.id === 31337);
  const garnetChain = supportedChains.find((chain) => chain.id === 17069);
  const redstoneChain = supportedChains.find((chain) => chain.id === 690);

  const chainChoice = await prompts({
    type: "select",
    name: "chain",
    message: "Select a chain:",
    choices: [
      {
        title: "Foundry",
        value: foundryChain,
      },
      {
        title: "Garnet",
        value: garnetChain,
      },
      {
        title: "Redstone Mainnet",
        value: redstoneChain,
      },
    ],
    initial: 0,
  });

  const broadcast = await prompts({
    type: "toggle",
    name: "value",
    message: "Broadcast transactions?",
    initial: false,
    active: "y",
    inactive: "n",
  });

  const worldAddress = worlds[chainChoice.chain.id as keyof typeof worlds]?.address;
  if (!worldAddress) throw new Error(`No world address found for chain ${chainChoice.chain.id}`);

  const gasPriceCommand = `cast gas-price --rpc-url "${chainChoice.chain.rpcUrls.default.http[0]}"`;
  console.log(`Running: ${gasPriceCommand}`);
  const gasPriceOutput = execSync(gasPriceCommand).toString();
  const gasPrice = parseInt(gasPriceOutput);

  if (isNaN(gasPrice)) {
    throw new Error("Failed to get gas price");
  }
  console.log(`Gas price: ${gasPrice}`);

  const forgeScriptCommand = `${
    chainChoice.chain.id === foundryChain?.id
      ? "PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 "
      : ""
  }forge script --with-gas-price ${gasPrice} --sig "run(address)" --rpc-url "${
    chainChoice.chain.rpcUrls.default.http[0]
  }"${broadcast.value ? " --broadcast" : ""} migrations/${migrationName}:${contractName} ${worldAddress}`;

  // exec command
  console.log(`Running: ${forgeScriptCommand}`);
  exec(forgeScriptCommand, (err: any, stdout: any, stderr: any) => {
    console.log(stdout);
    console.log(stderr);

    if (!err && broadcast.value) {
      console.log("Migration successful!");
    }
  });
})();
