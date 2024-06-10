import { createSkyStrife } from "../src/createSkyStrife";
import { DateTime } from "luxon";
import { createMatchTimes } from "client/src/app/amalgema-ui/utils/matchSchedule";
import { Entity, Has, Not, NotValue, getComponentValueStrict, runQuery } from "@latticexyz/recs";
import { createMatchEntity } from "client/src/createMatchEntity";
import { findOldestMatchInWindow } from "client/src/app/amalgema-ui/utils/skypool";
import { Hex, padHex, stringToHex } from "viem";
import { MATCH_SYSTEM_ID, SEASON_PASS_ONLY_SYSTEM_ID } from "client/src/constants";
import { z } from "zod";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { encodeSystemCallFrom } from "@latticexyz/world/internal";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { skystrifeDebug } from "client/src/debug";

const debug = skystrifeDebug.extend("matchScheduler");

/**
 * Be sure to use the Sky Strife Holder private key for this script.
 * Use the PRIVATE_KEY environment variable to set it.
 *
 * This script is designed to be run any time and will create all matches in the current
 * 24 hour window. Running it multiple times in the same window will not create
 * duplicate matches.
 *
 * It attempts to recover from failed match creation by filling in missing matches in the
 * current window.
 */

// matchName, levelName, seasonPassOnly
const matchesToCreate = [
  ["4P Free", "Vortex", false],
  ["4P Free", "Vortex", false],
  ["4P Free", "Vortex", false],
  ["4P Free", "Vortex", false],
  ["3P Free", "Scatter", false],
  ["3P Free", "Scatter", false],
  ["4P Season Pass", "Cauldron", true],
  ["4P Season Pass", "Cauldron", true],
  ["4P Season Pass", "Cauldron", true],
  ["4P Season Pass", "Cauldron", true],
  ["2P Season Pass", "Isle", true],
  ["2P Season Pass", "Isle", true],
] as const;

const {
  networkLayer,
  networkLayer: {
    components: { MatchConfig, MatchFinished, MatchName, SeasonTimes },
    network: { worldContract, waitForTransaction },
    utils: { getSkyKeyHolder },
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

function getScheduledMatches() {
  const now = DateTime.now().toUTC();
  const seasonTimes = getComponentValueStrict(SeasonTimes, singletonEntity);
  const seasonStart = DateTime.fromSeconds(Number(seasonTimes.seasonStart));
  const seasonEnd = DateTime.fromSeconds(Number(seasonTimes.seasonEnd));

  const matchTimes = createMatchTimes(now, 2).filter((time) => {
    return time >= seasonStart && time <= seasonEnd;
  });
  if (matchTimes.length === 0) {
    debug(`No match times found for current season.`);
    return {};
  } else {
    debug(`Found ${matchTimes.length} match times for current season.`);
    debug(`First match time: ${matchTimes[0].toISO()}`);
    debug(`Last match time: ${matchTimes[matchTimes.length - 1].toISO()}`);
  }
  const matchTimesToMatches = {} as Record<string, Entity[]>;

  for (const time of matchTimes) {
    if (time.toSeconds() < now.toSeconds()) continue;
    matchTimesToMatches[time.toSeconds().toString()] = [];
  }

  const scheduledMatches = [
    ...runQuery([Has(MatchConfig), Not(MatchFinished), NotValue(MatchConfig, { registrationTime: BigInt(0) })]),
  ];
  debug(`Found ${scheduledMatches.length} scheduled matches.`);

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
  const skyKeyHolder = getSkyKeyHolder();
  if (!skyKeyHolder.address) throw new Error("could not find sky key holder");

  const scheduledMatches = getScheduledMatches();
  for (const [time, matches] of Object.entries(scheduledMatches)) {
    const parsedTime = DateTime.fromSeconds(parseInt(time)).toUTC();
    debug(`${matches.length} matches scheduled for ${parsedTime.toISO()}.`);

    // if the matches scheduled for a specified time do not match what is expected,
    // we attempt to fill in the missing matches
    if (matches.length !== matchesToCreate.length) {
      debug(`Number of scheduled matches does not match expected number for ${parsedTime.toISO()}.`);
      const remainingMatchesToCreate = [...matchesToCreate];
      for (const match of matches) {
        const matchName = getComponentValueStrict(MatchName, match).value;
        const foundMatchIndex = remainingMatchesToCreate.findIndex(([name]) => name === matchName);
        if (foundMatchIndex === -1) {
          continue;
        }
        remainingMatchesToCreate.splice(foundMatchIndex, 1);
      }

      for (const [name, levelId, seasonPassOnly] of remainingMatchesToCreate) {
        debug(`Creating match ${name} at ${parsedTime.toISO()}.`);
        const matchEntity = createMatchEntity();
        const levelHex = stringToHex(levelId, { size: 32 });

        if (!args.BROADCAST) {
          debug(`Dry run only, no tx sent.`);
          continue;
        }

        let retryCount = 0;
        let success = false;
        while (retryCount < 3 && !success) {
          try {
            const tx = await worldContract.write.callFrom(
              encodeSystemCallFrom({
                abi: IWorldAbi,
                from: skyKeyHolder.address,
                systemId: MATCH_SYSTEM_ID,
                functionName: "createMatchSkyKey",
                args: [
                  name,
                  (findOldestMatchInWindow(networkLayer) ?? matchEntity) as Hex,
                  matchEntity,
                  levelHex,
                  seasonPassOnly ? SEASON_PASS_ONLY_SYSTEM_ID : padHex("0x"),
                  0n,
                  [],
                  BigInt(time),
                ],
              }),
            );

            await waitForTransaction(tx);
          } catch (e) {
            console.error(`Failed to create match ${name} at ${parsedTime.toISO()}. Retrying...`);
            retryCount++;
            continue;
          }
          success = true;
        }

        if (success) await worldContract.write.copyMap([matchEntity]);
      }
    }
  }
}

setInterval(scheduleMatches, 60 * 60 * 1000);
scheduleMatches();
