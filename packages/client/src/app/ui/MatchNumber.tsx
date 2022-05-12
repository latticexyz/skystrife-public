import { Entity } from "@latticexyz/recs";
import { useComponentValue } from "@latticexyz/react";
import { useStore } from "../../useStore";

type Props = {
  matchEntity: Entity;
};

export function MatchNumber({ matchEntity }: Props) {
  const { networkLayer } = useStore();
  if (!networkLayer) {
    throw new Error("network layer not ready");
  }

  const { MatchIndex } = networkLayer.components;
  const matchIndex = useComponentValue(MatchIndex, matchEntity)?.matchIndex;

  return <>{matchIndex ? `#${matchIndex}` : "??"}</>;
}
