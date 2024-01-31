import { useAmalgema } from "../../../useAmalgema";
import { Entity, Has, getComponentValueStrict, runQuery, getComponentValue } from "@latticexyz/recs";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { isDefined } from "@latticexyz/common/utils";
import { EMOJI } from "../../../constants";
import { times } from "lodash";

export function useMatchRewards(matchEntity: Entity) {
  const {
    components: { MatchConfig, MatchReward, MatchSweepstake },
    utils: { getLevelSpawns },
  } = useAmalgema();

  const skypoolRewards = [...runQuery([Has(MatchReward)])]
    .map((key) => {
      const { entity, rank } = decodeEntity(MatchReward.metadata.keySchema, key);
      if (entity !== matchEntity) return;

      const { value } = getComponentValueStrict(MatchReward, key);

      const emoji = EMOJI;

      return { rank, value, emoji };
    })
    .filter(isDefined);

  const matchConfig = getComponentValue(MatchConfig, matchEntity);
  const levelSpawns = getLevelSpawns(matchConfig?.levelId ?? "0");

  const matchSweepstake = getComponentValue(MatchSweepstake, matchEntity);
  const entranceFee = matchSweepstake?.entranceFee ?? 0n;
  const totalSweepstakeRewardPool = entranceFee * BigInt(levelSpawns.length);
  const sweepstakeRewards = times(levelSpawns.length + 1, (i) => {
    const percentage = matchSweepstake?.rewardPercentages[i] ?? 0n;
    const value = (totalSweepstakeRewardPool * percentage) / 100n;

    return { rank: i, value };
  });

  const totalRewards = skypoolRewards.map(({ value }, i) => {
    const sweepstakeReward = sweepstakeRewards[i]?.value ?? 0n;
    return { rank: i, value: value + sweepstakeReward };
  });

  return {
    skypoolRewards,
    sweepstakeRewards,
    totalRewards,
    entranceFee,
  };
}
