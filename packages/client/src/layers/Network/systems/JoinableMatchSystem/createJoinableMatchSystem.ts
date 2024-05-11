import { Entity, Has, Not, defineSystem, getComponentValue, runQuery, setComponent } from "@latticexyz/recs";
import { NetworkLayer } from "../../types";
import { DateTime } from "luxon";
import { ALLOW_LIST_SYSTEM_ID } from "../../../../constants";
import { decodeEntity } from "@latticexyz/store-sync/recs";

/**
 * Calculating the "liveness" of a match is an expensive operation that was
 * hindering UI performance. Doing it here on a slower cadence helps with that.
 */
export function createJoinableMatchSystem(layer: NetworkLayer) {
  const {
    world,
    components: { MatchJoinable, MatchConfig, MatchReady, MatchFinished, MatchAllowed, MatchAccessControl, AllowList },
    utils: { matchIsLive },
  } = layer;

  const setMatchJoinable = (matchEntity: Entity) => {
    const currentTime = DateTime.utc().toSeconds();
    const matchIsNotLive = !matchIsLive(matchEntity);
    const matchConfig = getComponentValue(MatchConfig, matchEntity);
    if (!matchConfig) {
      setComponent(MatchJoinable, matchEntity, { value: false });
      return;
    }

    const registrationOpen = matchConfig.registrationTime <= BigInt(Math.floor(currentTime));

    if (matchIsNotLive && registrationOpen) {
      setComponent(MatchJoinable, matchEntity, { value: true });
    } else {
      setComponent(MatchJoinable, matchEntity, { value: false });
    }
  };

  const updateJoinableMatches = () => {
    const matchesToCheck = runQuery([Has(MatchConfig), Not(MatchFinished)]);

    for (const matchEntity of matchesToCheck) {
      setMatchJoinable(matchEntity);
    }
  };

  updateJoinableMatches();
  setInterval(updateJoinableMatches, 30_000);

  defineSystem(world, [Has(MatchConfig), Has(MatchReady), Not(MatchFinished)], ({ entity }) =>
    setMatchJoinable(entity),
  );
  defineSystem(world, [Has(MatchConfig), Not(MatchReady), Not(MatchFinished)], ({ entity }) =>
    setMatchJoinable(entity),
  );

  defineSystem(world, [Has(MatchAccessControl)], ({ entity }) => {
    const matchAccessControl = getComponentValue(MatchAccessControl, entity);
    if (!matchAccessControl) return;

    const hasAllowList = matchAccessControl.systemId === ALLOW_LIST_SYSTEM_ID;

    if (hasAllowList) {
      // equivalent to [...runQuery([Has(MatchAllowed)])] but faster
      const matchAllowedEntities = Array.from(MatchAllowed.entities());
      const allowList = matchAllowedEntities
        .map((entity) => decodeEntity(MatchAllowed.metadata.keySchema, entity))
        .filter(({ matchEntity }) => entity === matchEntity)
        .map(({ account }) => account);

      setComponent(AllowList, entity, { value: allowList });
    }
  });
}
