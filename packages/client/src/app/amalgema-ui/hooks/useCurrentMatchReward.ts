import { useEffect, useState } from "react";
import { useAmalgema } from "../../../useAmalgema";
import { getMatchRewardAtTime } from "../utils/skypool";
import { useCurrentBlockTime } from "./useCurrentBlockTime";

export function useCurrentMatchReward() {
  const networkLayer = useAmalgema();
  const [reward, setReward] = useState(0n);

  const currentBlockTime = useCurrentBlockTime();

  useEffect(() => {
    const reward = getMatchRewardAtTime(networkLayer, currentBlockTime);
    setReward(reward);
  }, [currentBlockTime, networkLayer]);

  return reward;
}
