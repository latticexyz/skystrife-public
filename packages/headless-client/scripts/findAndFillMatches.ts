import { Has, Not, HasValue, getComponentValueStrict, runQuery, getComponentValue } from "@latticexyz/recs";

import { createSkyStrife, env } from "../src/createSkyStrife";
import fs from "fs";
import path from "path";
import { Hex } from "viem";
import { skystrifeDebug } from "client/src/debug";
import { ExecaChildProcess, execa } from "execa";
import lodash from "lodash";
import { DateTime } from "luxon";

const { shuffle } = lodash;

import { z } from "zod";

const matchFillerEnv = z
  .object({
    NUM_MATCHES: z.coerce.number().positive(),
  })
  .parse(process.env, {
    errorMap: (issue) => ({
      message: `Missing or invalid environment variable: ${issue.path.join(".")}`,
    }),
  });

const debug = skystrifeDebug.extend("fill-matches");

const skyStrife = await createSkyStrife();

const { networkLayer } = skyStrife;

const {
  components: { MatchConfig, MatchFinished, MatchAccessControl, MatchSweepstake },
  utils: { getAvailableLevelSpawns },
} = networkLayer;

const chainId = env.CHAIN_ID;
const walletFolderPath = path.join(`wallets`, `${chainId}`);
const files = fs.readdirSync(walletFolderPath);

let accounts = [] as {
  address: Hex;
  privateKey: Hex;
  inMatch: boolean;
}[];

for (const file of files) {
  const filePath = path.join(walletFolderPath, file);
  const walletInfo = fs.readFileSync(filePath).toString();
  const account = walletInfo.split(",").map((s) => s.trim()) as [Hex, Hex];

  accounts.push({
    address: account[0],
    privateKey: account[1],
    inMatch: false,
  });
}

accounts = shuffle(accounts);

debug(`Found ${accounts.length} funded accounts`);

debug(`Searching for open matches...`);
let openMatches = [...runQuery([Has(MatchConfig), HasValue(MatchConfig, { startTime: 0n }), Not(MatchFinished)])];
openMatches = openMatches.filter((m) => {
  const matchConfig = getComponentValueStrict(MatchConfig, m);
  const entranceFee = getComponentValue(MatchSweepstake, m)?.entranceFee;
  const accessSystem = getComponentValue(MatchAccessControl, m)?.systemId;

  return (
    accessSystem === "0x0000000000000000000000000000000000000000000000000000000000000000" &&
    matchConfig.registrationTime < DateTime.now().toSeconds() &&
    !entranceFee
  );
});
openMatches = openMatches.slice(0, matchFillerEnv.NUM_MATCHES);

debug(`Found ${openMatches.length} open matches.`);
debug(`Filling...`);

const botProcesses = [] as ExecaChildProcess<string>[];

for (const matchEntity of openMatches) {
  const availableAccounts = accounts.filter((a) => !a.inMatch);
  const { levelId } = getComponentValueStrict(MatchConfig, matchEntity);
  const spawns = getAvailableLevelSpawns(levelId, matchEntity as Hex);
  if (spawns.length === 0) continue;

  for (let i = 0; i < spawns.length; i++) {
    const botAccount = availableAccounts[i];
    if (!botAccount) {
      debug("Ran out of bot accounts, skipping join");
      continue;
    }
    const botProcess = execa("tsx", ["scripts/createBotPlayer.ts"], {
      extendEnv: true,
      env: {
        CHAIN_ID: env.CHAIN_ID.toString(),
        PRIVATE_KEY: botAccount.privateKey,
        MATCH_ENTITY: matchEntity,
        DEBUG: "skystrife:*",
      },
    });
    if (botProcess.pipeStdout) botProcess.pipeStdout(`output/${botAccount.address}.txt`);
    if (botProcess.pipeStderr) botProcess.pipeStderr(`output/${botAccount.address}-error.txt`);

    const botIndex = accounts.findIndex((a) => a.address === botAccount.address);
    accounts[botIndex].inMatch = true;

    botProcesses.push(botProcess);
    debug(`Bot ${botAccount.address} joined match ${matchEntity}`);
  }

  debug(`Match ${matchEntity} filled.`);
}

debug(`Filled ${openMatches.length} open matches with ${botProcesses.length} bots. Waiting for matches to finish...`);
await Promise.all([...botProcesses]);
process.exit(0);
