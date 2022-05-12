import { Entity, Has, defineEnterSystem, getComponentValueStrict, setComponent } from "@latticexyz/recs";
import { AnalyticsLayer } from "../types";

export function createUnitBuySystem(layer: AnalyticsLayer) {
  const {
    world,
    networkLayer: {
      components: { UnitType, OwnedBy, Position, Match },
    },
    clock,
    utils: { getCurrentBlockNumber, storePlayerTotalUnitSnapshot, getOwningPlayer, getTurnAtTime },
    components: { UnitBuy },
  } = layer;

  defineEnterSystem(world, [Has(UnitType), Has(OwnedBy), Has(Position)], ({ entity }) => {
    const unitType = getComponentValueStrict(UnitType, entity).value;
    const player = getOwningPlayer(entity);
    if (!player) return;
    const position = getComponentValueStrict(Position, entity);
    const matchEntity = getComponentValueStrict(Match, player).matchEntity as Entity;
    const turn = getTurnAtTime(matchEntity, clock.currentTime / 1000);

    setComponent(UnitBuy, entity, {
      turn,
      createdAtBlock: getCurrentBlockNumber(),
      matchEntity,
      player,
      unitType,
      x: position.x,
      y: position.y,
    });

    storePlayerTotalUnitSnapshot(player);
  });
}
