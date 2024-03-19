import { useEffect, useState } from "preact/hooks";
import { PhaserLayer } from "../../Renderer/Phaser";
import { Entity } from "@latticexyz/recs";
import { useComponentValue } from "./useComponentValue";
import { createUseCurrentTime } from "./useCurrentTime";

type MatchStatus = "unknown" | "unstarted" | "started" | "finished";

export function createUseMatchStatus(layer: PhaserLayer) {
  const {
    parentLayers: {
      network: {
        components: { MatchFinished, MatchConfig },
        network: { matchEntity },
      },
      local: {
        components: { MatchStarted },
      },
    },
  } = layer;

  const useCurrentTime = createUseCurrentTime(layer);

  return function useMatchStatus(): MatchStatus {
    const [matchStatus, setMatchStatus] = useState<MatchStatus>("unknown");

    const now = useCurrentTime();
    const matchConfig = useComponentValue(MatchConfig, matchEntity as Entity);
    const matchStarted = useComponentValue(MatchStarted, matchEntity as Entity)?.value;
    const matchFinished = useComponentValue(MatchFinished, matchEntity as Entity)?.value;

    useEffect(() => {
      if (matchFinished) {
        setMatchStatus("finished");
      } else if (matchStarted) {
        setMatchStatus("started");
      } else if (matchConfig && now / 1000 >= matchConfig.startTime) {
        setMatchStatus("unstarted");
      }
    }, [matchConfig, matchFinished, matchStarted, now]);

    return matchStatus;
  };
}
