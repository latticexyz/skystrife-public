import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { createSkyStrife } from "../src/createSkyStrife";
import { DateTime, Duration } from "luxon";
import { Entity, Has, Not, HasValue, getComponentValueStrict, runQuery, getComponentValue } from "@latticexyz/recs";
import { Hex } from "viem";
import { CANCEL_MATCH_SYSTEM_ID } from "client/src/constants";
import { encodeSystemCallFrom } from "@latticexyz/world/internal";
import { skystrifeDebug } from "client/src/debug";
import { singletonEntity } from "@latticexyz/store-sync/recs";

const debug = skystrifeDebug.extend("matchDestroyer");

const {
  networkLayer: {
    components: { MatchConfig, MatchFinished, MatchSky, MatchStaleTime, MatchName },
    network: { worldContract, waitForTransaction },
    utils: { getSkyKeyHolder },
  },
} = await createSkyStrife();

const skyKeyHolder = getSkyKeyHolder();

const cancelMatch = async (matchEntity: Entity) => {
  if (!skyKeyHolder.address) {
    throw new Error("No sky key holder found");
  }

  const matchName = getComponentValue(MatchName, matchEntity)?.value || matchEntity.toString();
  debug(`Canceling match ${matchName}`);
  try {
    const tx = await worldContract.write.callFrom(
      encodeSystemCallFrom({
        abi: IWorldAbi,
        from: skyKeyHolder.address,
        systemId: CANCEL_MATCH_SYSTEM_ID,
        functionName: "cancelMatch",
        args: [matchEntity as Hex],
      }),
    );

    await waitForTransaction(tx);
    debug(`Canceled match ${matchName}`);
  } catch (e) {
    debug(`Failed to cancel match ${matchName}`, e);
  }
};

const findStaleMatches = () => {
  const staleAfterDuration = Duration.fromObject({
    seconds: Number(getComponentValueStrict(MatchStaleTime, singletonEntity).value),
  });
  const unstartedMatches = [
    ...runQuery([Has(MatchConfig), Has(MatchSky), HasValue(MatchConfig, { startTime: 0n }), Not(MatchFinished)]),
  ];

  return unstartedMatches.filter((match) => {
    const createdAtTime = getComponentValueStrict(MatchSky, match).createdAt;
    return Number(createdAtTime) < DateTime.now().minus(staleAfterDuration).toSeconds();
  });
};

const cancelStaleMatches = async () => {
  const staleMatches = findStaleMatches();
  debug(`Found stale ${staleMatches.length} matches`);

  for (const match of staleMatches) {
    await cancelMatch(match);
  }
};

debug("Starting stale match destroyer...");
setInterval(cancelStaleMatches, 1000 * 60 * 5);
cancelStaleMatches();
