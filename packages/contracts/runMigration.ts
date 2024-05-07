import prompts from "prompts";
import fs from "fs/promises";
import path from "path";
import { supportedChains } from "client/src/mud/supportedChains";
import worlds from "./worlds.json";
import { runWorldScript } from "./runWorldScript";

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

  const migrationPath = path.join(migrationsDir, migrationName);
  await runWorldScript(chainChoice.chain, contractName, migrationPath, worldAddress, broadcast.value);
})();
