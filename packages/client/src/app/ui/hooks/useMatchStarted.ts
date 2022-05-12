import { useComponentValue } from "@latticexyz/react";
import { useMUD } from "../../../useMUD";
import { Entity } from "@latticexyz/recs";

export function useMatchStarted(matchEntity: Entity) {
  const {
    localLayer: {
      components: { MatchStarted },
    },
  } = useMUD();

  const matchStarted = useComponentValue(MatchStarted, matchEntity);

  return matchStarted?.value;
}
