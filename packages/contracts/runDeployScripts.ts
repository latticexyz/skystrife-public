import { supportedChains } from "client/src/mud/supportedChains";
import { isHex, stringToHex } from "viem";
import { z } from "zod";
import { runWorldScript } from "./runWorldScript";
import worlds from "./worlds.json";
import dotenv from "dotenv";

dotenv.config();

export const env = z
  .object({
    CHAIN_ID: z.coerce.number().positive(),
    PRIVATE_KEY: z.string().transform((val) => (val ? (isHex(val) ? val : stringToHex(val, { size: 64 })) : undefined)),
  })
  .parse(process.env, {
    errorMap: (issue) => ({
      message: `Missing or invalid environment variable: ${issue.path.join(".")}`,
    }),
  });

async function runDeployScripts() {
  const chain = supportedChains.find((chain) => chain.id === env.CHAIN_ID);
  if (!chain) throw new Error(`cannot find chain with id ${env.CHAIN_ID}`);

  const worldAddress = worlds[chain.id as unknown as keyof typeof worlds]?.address;
  if (!worldAddress) throw new Error(`No world address found for chain ${chain.id}`);

  await runWorldScript(chain, "DeployTemplates", "script/DeployTemplates.sol", worldAddress, true);
  await runWorldScript(chain, "DeployOrbs", "script/DeployOrbs.sol", worldAddress, true);
  await runWorldScript(chain, "DeploySeasonPass", "script/DeploySeasonPass.sol", worldAddress, true);
  await runWorldScript(chain, "DeploySkyKey", "script/DeploySkyKey.sol", worldAddress, true);
}
await runDeployScripts();
