import { NetworkLayer } from "../../types";
import { defineSystem, getComponentValue, Has, Not, setComponent } from "@latticexyz/recs";
import { decodeEntity } from "@latticexyz/store-sync/recs";

export function createMatchRankRewardsSystem(layer: NetworkLayer) {
  const {
    world,
    components: { MatchReward, MatchRankRewards, MatchFinished },
  } = layer;

  defineSystem(world, [Has(MatchReward), Not(MatchFinished)], ({ entity }) => {
    const matchReward = getComponentValue(MatchReward, entity);
    if (!matchReward) return;

    const { entity: matchEntity, rank } = decodeEntity(MatchReward.metadata.keySchema, entity);
    const { value } = matchReward;

    const previousRewards = getComponentValue(MatchRankRewards, matchEntity) ?? {
      ranks: [],
      rewards: [],
    };

    setComponent(MatchRankRewards, matchEntity, {
      ranks: [...previousRewards.ranks, rank],
      rewards: [...previousRewards.rewards, value],
    });
  });
}
