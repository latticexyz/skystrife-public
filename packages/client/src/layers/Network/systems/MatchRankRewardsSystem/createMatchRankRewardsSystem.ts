import { NetworkLayer } from "../../types";
import { defineSystem, getComponentValue, Has, Not, setComponent } from "@latticexyz/recs";
import { decodeEntity } from "@latticexyz/store-sync/recs";

export function createMatchRankRewardsSystem(layer: NetworkLayer) {
  const {
    world,
    components: { MatchReward, MatchRankRewards, MatchFinished, PracticeMatch, MatchConfig },
    utils: { getLevelSpawns },
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

  defineSystem(world, [Has(PracticeMatch), Has(MatchConfig), Not(MatchFinished)], ({ entity }) => {
    const levelId = getComponentValue(MatchConfig, entity)?.levelId;
    if (!levelId) return;

    const numSpawns = getLevelSpawns(levelId).length;
    const rewards = new Array(numSpawns).fill(0n);
    const ranks = new Array(numSpawns).map((_, i) => i);

    setComponent(MatchRankRewards, entity, {
      ranks: [...ranks],
      rewards: [...rewards],
    });
  });
}
