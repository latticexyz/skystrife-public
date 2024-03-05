import { createUsePlayersInMatch } from "./usePlayersInMatch";
import { createUseSelectedEntity } from "./useSelectedEntity";
import { useEntityQuery } from "./useEntityQuery";
import { useDeepMemo } from "./useDeepMemo";
import { PhaserLayer } from "../../Renderer/Phaser";

export function createClientHooks(layer: PhaserLayer) {
  return {
    usePlayersInMatch: createUsePlayersInMatch(layer),
    useSelectedEntity: createUseSelectedEntity(layer),
    useDeepMemo,
    useEntityQuery,
  };
}
