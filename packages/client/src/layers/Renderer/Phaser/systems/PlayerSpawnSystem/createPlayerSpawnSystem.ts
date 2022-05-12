import { defineEnterSystem, Has, HasValue, runQuery } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";
import { decodeMatchEntity } from "../../../../../decodeMatchEntity";
import { useStore } from "../../../../../useStore";
import { addressToEntityID } from "../../../../../mud/setupNetwork";

export function createPlayerSpawnSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { SpawnPoint, OwnedBy, MatchFinished, Match },
        utils: { getPlayerEntity },
        network: { matchEntity },
      },
      local: {
        components: { MatchStarted },
        api: { resetSelection },
      },
    },
    api: { selectAndView },
  } = layer;

  defineEnterSystem(world, [Has(MatchStarted)], () => {
    const { externalWalletClient } = useStore.getState();

    if (!externalWalletClient || !externalWalletClient.account) return;

    const { address } = externalWalletClient.account;

    const spawnSettlement = [
      ...runQuery([
        Has(SpawnPoint),
        HasValue(OwnedBy, { value: decodeMatchEntity(getPlayerEntity(addressToEntityID(address))).entity }),
      ]),
    ][0];
    if (!spawnSettlement) return;

    selectAndView(spawnSettlement);
  });

  // When loading a match that is finished
  // we don't want the home settlement to be selected
  // and bleed through the end screen
  if (matchEntity) {
    defineEnterSystem(world, [Has(MatchFinished), HasValue(Match, { matchEntity })], () => {
      resetSelection();
    });
  }
}
