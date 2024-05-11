import { Entity, Has, getComponentValue, getComponentValueStrict, runQuery } from "@latticexyz/recs";
import { NetworkLayer } from "../../../layers/Network";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { DateTime } from "luxon";

export function getOldestMatchInWindow(layer: NetworkLayer, currentTimestamp: bigint, window: bigint) {
  const {
    components: { MatchSky },
  } = layer;

  const timestampOfStartOfRewardWindow = currentTimestamp > window ? currentTimestamp - window : 0;
  const allMatches = runQuery([Has(MatchSky)]);

  let foundMatch: Entity | undefined;
  let maxTimestamp = BigInt(2) ** BigInt(256) - BigInt(1);

  for (const matchEntity of allMatches) {
    const matchCreatedAt = getComponentValueStrict(MatchSky, matchEntity).createdAt;
    if (matchCreatedAt > timestampOfStartOfRewardWindow && matchCreatedAt < maxTimestamp) {
      maxTimestamp = matchCreatedAt;
      foundMatch = matchEntity;
    }
  }

  return foundMatch;
}

export const findOldestMatchInWindow = (networkLayer: NetworkLayer) => {
  const skypoolConfig = getSkypoolConfig(networkLayer);
  if (!skypoolConfig) return;

  const now = BigInt(Math.floor(DateTime.now().toUTC().toSeconds()));
  const oldestMatchInWindow = getOldestMatchInWindow(networkLayer, BigInt(now), skypoolConfig.window);

  return oldestMatchInWindow;
};

const getReward = (cost: bigint, numberOfMatches: number) => {
  if (numberOfMatches < 300) {
    return cost * 3n;
  } else if (numberOfMatches < 500) {
    return cost * 2n;
  } else if (numberOfMatches < 800) {
    return (cost * 150n) / 100n;
  } else if (numberOfMatches < 1000) {
    return (cost * 120n) / 100n;
  } else if (numberOfMatches < 1200) {
    return cost;
  } else if (numberOfMatches < 1400) {
    return (cost * 90n) / 100n;
  } else if (numberOfMatches < 1700) {
    return (cost * 75n) / 100n;
  } else if (numberOfMatches < 2000) {
    return (cost * 60n) / 100n;
  } else {
    return (cost * 50n) / 100n;
  }
};

export function getSkypoolConfig(layer: NetworkLayer) {
  const {
    components: { SkyPoolConfig },
  } = layer;

  const skypoolEntity = [...runQuery([Has(SkyPoolConfig)])][0];
  const skypoolConfig = getComponentValue(SkyPoolConfig, skypoolEntity);
  if (!skypoolConfig) return;

  return skypoolConfig;
}

export function getMatchRewardAtTime(layer: NetworkLayer, timestamp: bigint) {
  const {
    components: { LastMatchIndex, MatchIndex },
  } = layer;

  const skypoolConfig = getSkypoolConfig(layer);
  if (!skypoolConfig) return 0n;

  const { cost, window } = skypoolConfig;

  const oldestMatch = getOldestMatchInWindow(layer, timestamp, window);
  const nextMatchIndex = (getComponentValue(LastMatchIndex, singletonEntity)?.matchIndex ?? 0) + 1;
  const oldestMatchIndex = getComponentValue(MatchIndex, oldestMatch ?? ("0" as Entity))?.matchIndex ?? nextMatchIndex; // if there is no match in the window, next match index and oldest match index are the same

  const numberOfMatches = nextMatchIndex - oldestMatchIndex;
  const reward = getReward(cost, numberOfMatches);

  return reward;
}
