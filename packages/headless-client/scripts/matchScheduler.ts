import { createSkyStrife } from "../src/createSkyStrife";
import { DateTime } from "luxon";
import { createMatchTimes } from "client/src/app/amalgema-ui/utils/matchSchedule";
import { Entity, Has, Not, NotValue, getComponentValueStrict, runQuery } from "@latticexyz/recs";
import { createMatchEntity } from "client/src/createMatchEntity";
import { findOldestMatchInWindow } from "client/src/app/amalgema-ui/utils/skypool";
import { Hex, padHex, stringToHex } from "viem";
import { SEASON_PASS_ONLY_SYSTEM_ID } from "client/src/constants";
import { z } from "zod";

/**
 * Be sure to use the Sky Strife Holder private key for this script.
 * Use the PRIVATE_KEY environment variable to set it.
 *
 * This script is designed to be run any time and will create all matches in the current
 * 24 hour window. Running it multiple times in the same window will not create
 * duplicate matches.
 *
 * It currently cannot recover from a failed match creation, and will ignore the time
 * period on a subsequent run (because it already sees the time as having matches).
 */

// matchName, levelName, seasonPassOnly
const matchesToCreate = [
  ["Cauldron (Free)", "Cauldron-2", false],
  ["Antelope (Free)", "Antelope 2", false],
  ["Isle (SP)", "The Isle", true],
] as const;

const {
  networkLayer,
  networkLayer: {
    components: { MatchConfig, MatchFinished },
    network: { worldContract, waitForTransaction },
  },
} = await createSkyStrife();

const args = z
  .object({
    BROADCAST: z.coerce.boolean().optional().default(false),
  })
  .parse(process.env, {
    errorMap: (issue) => ({
      message: `Missing or invalid environment variable: ${issue.path.join(".")}`,
    }),
  });

/**
 * Get all matches that are scheduled to start in the current 24 hour window.
 */
function getScheduledMatches() {
  const now = DateTime.now().toUTC();

  const matchTimes = createMatchTimes(now, 2);
  const matchTimesToMatches = {} as Record<string, Entity[]>;

  for (const time of matchTimes) {
    if (time.toSeconds() < now.toSeconds()) continue;
    matchTimesToMatches[time.toSeconds().toString()] = [];
  }

  const scheduledMatches = [
    ...runQuery([Has(MatchConfig), Not(MatchFinished), NotValue(MatchConfig, { registrationTime: BigInt(0) })]),
  ];
  console.log(`Found ${scheduledMatches.length} scheduled matches.`);

  for (const match of scheduledMatches) {
    const registrationTime = getComponentValueStrict(MatchConfig, match).registrationTime;
    if (registrationTime < now.toSeconds()) continue;

    for (const time of matchTimes) {
      if (BigInt(time.toSeconds()) === registrationTime) {
        matchTimesToMatches[time.toSeconds().toString()].push(match);
      }
    }
  }

  return matchTimesToMatches;
}

export async function scheduleMatches() {
  const scheduledMatches = getScheduledMatches();
  for (const [time, matches] of Object.entries(scheduledMatches)) {
    const parsedTime = DateTime.fromSeconds(parseInt(time)).toUTC();
    console.log(`${matches.length} matches scheduled for ${parsedTime.toISO()}.`);

    // if match creation fails for a specific time, this has no way of recovering from that
    // and will ignore the time period on a subsequent run
    if (matches.length === 0) {
      console.log(`No matches scheduled for ${parsedTime.toISO()}.`);

      for (const [name, levelId, seasonPassOnly] of matchesToCreate) {
        console.log(`Creating match ${name} at ${parsedTime.toISO()}.`);
        const matchEntity = createMatchEntity();
        const levelHex = stringToHex(levelId, { size: 32 });

        if (!args.BROADCAST) {
          console.log(`Dry run only, no tx sent.`);
          continue;
        }

        let retryCount = 0;
        let success = false;
        while (retryCount < 3 && !success) {
          try {
            const tx = await worldContract.write.createMatchSkyKey([
              name,
              (findOldestMatchInWindow(networkLayer) ?? matchEntity) as Hex,
              matchEntity,
              levelHex,
              seasonPassOnly ? SEASON_PASS_ONLY_SYSTEM_ID : padHex("0x"),
              0n,
              [],
              BigInt(time),
            ]);

            await waitForTransaction(tx);
          } catch (e) {
            console.error(`Failed to create match ${name} at ${parsedTime.toISO()}. Retrying...`);
            retryCount++;
            continue;
          }
          success = true;
        }

        await worldContract.write.copyMap([matchEntity]);
      }
    }
  }
}

setInterval(scheduleMatches, 60 * 60 * 1000);
scheduleMatches();
