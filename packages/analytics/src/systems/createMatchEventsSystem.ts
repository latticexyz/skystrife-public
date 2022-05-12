import {
  Entity,
  Has,
  defineEnterSystem,
  getComponentValue,
  getComponentValueStrict,
  setComponent,
} from "@latticexyz/recs";
import { uuid } from "@latticexyz/utils";
import { parseBytes32String } from "ethers/lib/utils";
import { AnalyticsLayer } from "../types";

export function createMatchEventsSystem(layer: AnalyticsLayer) {
  const {
    world,
    networkLayer: {
      components: { MatchConfig, Match, Player, MatchFinished, MatchRanking, OwnedBy },
    },
    components: { CreateMatch, JoinMatch, EndMatch },
    utils: { getCurrentBlockNumber },
  } = layer;

  defineEnterSystem(world, [Has(MatchConfig)], ({ entity: matchEntity }) => {
    const matchConfig = getComponentValueStrict(MatchConfig, matchEntity);
    const createMatchEventEntity = uuid() as Entity;
    setComponent(CreateMatch, createMatchEventEntity, {
      createdAtBlock: getCurrentBlockNumber(),
      mainWalletAddress: matchConfig.createdBy as Entity,
      map: parseBytes32String(matchConfig.levelId) as Entity,
      matchEntity,
    });
  });

  defineEnterSystem(world, [Has(Player), Has(OwnedBy), Has(Match)], ({ entity }) => {
    const matchEntity = getComponentValueStrict(Match, entity).matchEntity as Entity;
    const mainWallet = getComponentValue(OwnedBy, entity as Entity)?.value ?? "";

    const joinMatchEventEntity = uuid() as Entity;
    setComponent(JoinMatch, joinMatchEventEntity, {
      mainWalletAddress: mainWallet,
      createdAtBlock: getCurrentBlockNumber(),
      player: entity,
      matchEntity,
    });
  });

  defineEnterSystem(world, [Has(MatchFinished), Has(MatchRanking)], ({ entity }) => {
    const players = getComponentValueStrict(MatchRanking, entity).value;

    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const endMatchEventEntity = uuid() as Entity;
      setComponent(EndMatch, endMatchEventEntity, {
        createdAtBlock: getCurrentBlockNumber(),
        player: player as Entity,
        matchEntity: entity,
        ranking: i,
      });
    }
  });
}
