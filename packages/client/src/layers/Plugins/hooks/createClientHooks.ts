import { createUsePlayersInMatch } from "./usePlayersInMatch";
import { createUseSelectedEntity } from "./useSelectedEntity";
import { useEntityQuery } from "./useEntityQuery";
import { useDeepMemo } from "./useDeepMemo";
import { PhaserLayer } from "../../Renderer/Phaser";
import { createUseTransactions } from "./useTransactions";
import { createUseMatchStatus } from "./useMatchStatus";
import { useComponentValue } from "./useComponentValue";
import { createUseCurrentTime } from "./useCurrentTime";

export function createClientHooks(layer: PhaserLayer) {
  return {
    usePlayersInMatch: createUsePlayersInMatch(layer),
    useSelectedEntity: createUseSelectedEntity(layer),
    useDeepMemo,
    useEntityQuery,
    useTransactions: createUseTransactions(layer),
    useMatchStatus: createUseMatchStatus(layer),
    useComponentValue: useComponentValue,
    useCurrentTime: createUseCurrentTime(layer),
  };
}
