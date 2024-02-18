import { Entity, Has, defineEnterSystem, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";

import { createSkyStrife } from "../src/createSkyStrife";
import { encodeMatchEntity } from "client/src/encodeMatchEntity";

const skyStrife = await createSkyStrife();

const {
  networkLayer: {
    world,
    components: { MatchName, MatchFinished, MatchRanking, OwnedBy, Name },
  },
} = skyStrife;

defineEnterSystem(world, [Has(MatchName), Has(MatchFinished), Has(MatchRanking)], ({ entity: matchEntity }) => {
  const matchName = getComponentValueStrict(MatchName, matchEntity).value;

  // an array of in-match player entities
  // the order is the place they came in
  // 0 index is winner, 1 index is second place, etc.
  const matchRanking = getComponentValueStrict(MatchRanking, matchEntity).value;

  const playerAddresses = matchRanking.map((playerEntityId) => {
    const entity = encodeMatchEntity(matchEntity, playerEntityId);
    const owner = getComponentValue(OwnedBy, entity)?.value;

    if (!owner) return entity;

    return owner as Entity;
  });

  console.log(`Match ${matchName} finished!`);
  playerAddresses.forEach((playerAddress, index) => {
    const playerName = getComponentValue(Name, playerAddress)?.value ?? playerAddress;
    console.log(`Player ${playerName} came in ${index + 1} place`);
  });
  console.log("----------\n");
});
