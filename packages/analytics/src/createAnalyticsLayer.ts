import {
  Component,
  Entity,
  Has,
  HasValue,
  Type,
  defineComponent,
  getComponentValue,
  getComponentValueStrict,
  hasComponent,
  namespaceWorld,
  runQuery,
  setComponent,
} from "@latticexyz/recs";
import { createUnitBuySystem } from "./systems/createUnitBuySystem";
import { createUnitKillSystem } from "./systems/createUnitKillSystem";
import { createPreviousOwnerSystem } from "./systems/createPreviousOwnerSystem";
import { createMatchEventsSystem } from "./systems/createMatchEventsSystem";
import { uuid } from "@latticexyz/utils";
import { NetworkResult } from ".";
import { createClock } from "client/src/mud/createClock";
import { createTokenBalanceSystem } from "./systems/createTokenBalanceSystem";

export async function createAnalyticsLayer(network: NetworkResult) {
  const world = namespaceWorld(network.world, "analytics");
  const components = {
    // Meta Components used for populating Events
    PreviousOwner: defineComponent(
      world,
      {
        value: Type.Entity,
      },
      { id: "PreviousOwner" }
    ),

    // Match Events
    CreateMatch: defineComponent(
      world,
      {
        createdAtBlock: Type.BigInt,
        mainWalletAddress: Type.Entity,
        map: Type.Entity,
        matchEntity: Type.Entity,
      },
      { id: "CreateMatch" }
    ),
    CopyMap: defineComponent(
      world,
      {
        createdAtBlock: Type.BigInt,
        player: Type.Entity,
        matchEntity: Type.Entity,
      },
      { id: "CopyMap" }
    ),
    JoinMatch: defineComponent(
      world,
      {
        createdAtBlock: Type.BigInt,
        mainWalletAddress: Type.String,
        player: Type.Entity,
        matchEntity: Type.Entity,
      },
      { id: "JoinMatch" }
    ),
    EndMatch: defineComponent(
      world,
      {
        createdAtBlock: Type.BigInt,
        player: Type.Entity,
        matchEntity: Type.Entity,
        ranking: Type.Number,
      },
      { id: "EndMatch" }
    ),

    // In-match Events
    UnitKill: defineComponent(
      world,
      {
        turn: Type.Number,
        createdAtBlock: Type.BigInt,
        matchEntity: Type.Entity,
        killerPlayer: Type.Entity,
        victimPlayer: Type.Entity,
        killerUnitType: Type.Number,
        victimUnitType: Type.Number,
        x: Type.Number,
        y: Type.Number,
      },
      { id: "UnitKill" }
    ),
    UnitDeath: defineComponent(
      world,
      {
        turn: Type.Number,
        createdAtBlock: Type.BigInt,
        matchEntity: Type.Entity,
        killerPlayer: Type.Entity,
        victimPlayer: Type.Entity,
        killerUnitType: Type.Number,
        victimUnitType: Type.Number,
        x: Type.Number,
        y: Type.Number,
      },
      { id: "UnitDeath" }
    ),
    UnitBuy: defineComponent(
      world,
      {
        turn: Type.Number,
        createdAtBlock: Type.BigInt,
        matchEntity: Type.Entity,
        player: Type.Entity,
        unitType: Type.Number,
        x: Type.Number,
        y: Type.Number,
      },
      { id: "UnitBuy" }
    ),
    StructureCapture: defineComponent(
      world,
      {
        turn: Type.Number,
        createdAtBlock: Type.BigInt,
        matchEntity: Type.Entity,
        player: Type.Entity,
        previousOwnerPlayer: Type.Entity,
        capturerUnitType: Type.Number,
        structureType: Type.Number,
        x: Type.Number,
        y: Type.Number,
      },
      { id: "StructureCapture" }
    ),
    StructureKill: defineComponent(
      world,
      {
        turn: Type.Number,
        createdAtBlock: Type.BigInt,
        matchEntity: Type.Entity,
        killerPlayer: Type.Entity,
        victimPlayer: Type.Entity,
        killerUnitType: Type.Number,
        victimStructureType: Type.Number,
        x: Type.Number,
        y: Type.Number,
      },
      { id: "StructureKill" }
    ),

    // Updated on Match End
    TokenBalanceSnapshot: defineComponent(
      world,
      {
        createdAtBlock: Type.BigInt,
        mainWalletAddress: Type.String,
        balance: Type.Number,
      },
      { id: "TokenBalanceSnapshot" }
    ),

    // Updated on unit spawn and building capture
    GoldSnapshot: defineComponent(
      world,
      {
        createdAtBlock: Type.BigInt,
        matchEntity: Type.Entity,
        player: Type.Entity,
        balance: Type.Number,
      },
      { id: "GoldSnapshot" }
    ),

    // Updated on unit spawn and unit kill
    UnitSnapshot: defineComponent(
      world,
      {
        turn: Type.Number,
        createdAtBlock: Type.BigInt,
        matchEntity: Type.Entity,
        player: Type.Entity,
        unitType: Type.Number,
        count: Type.Number,
      },
      { id: "UnitSnapshot" }
    ),

    // Updated on building capture
    StructureSnapshot: defineComponent(
      world,
      {
        turn: Type.Number,
        createdAtBlock: Type.BigInt,
        matchEntity: Type.Entity,
        player: Type.Entity,
        structureType: Type.Number,
        count: Type.Number,
      },
      { id: "StructureSnapshot" }
    ),
  };

  const {
    components: { UnitType, OwnedBy, StructureType, MatchConfig, Match, Player },
  } = network;

  let currentBlockNumber = 0n;
  network.latestBlockNumber$.subscribe((blockNumber) => (currentBlockNumber = blockNumber));
  const getCurrentBlockNumber = () => currentBlockNumber;

  const clock = createClock({
    syncInterval: 1000,
    initialTime: Date.now(),
    period: 1000,
  });

  const getTurnAtTime = (matchEntity: Entity, time: number) => {
    const matchConfig = getComponentValue(MatchConfig, matchEntity);
    if (!matchConfig) return -1;

    const { startTime, turnLength } = matchConfig;

    let atTime = BigInt(Math.floor(time));
    if (atTime < startTime) atTime = startTime;

    return Number((atTime - startTime) / turnLength);
  };

  function findEntityWithComponentInRelationshipChain(
    relationshipComponent: Component<{ value: Type.String }>,
    entity: Entity,
    searchComponent: Component
  ): Entity | undefined {
    if (hasComponent(searchComponent, entity)) return entity;

    while (hasComponent(relationshipComponent, entity)) {
      const entityValue = getComponentValueStrict(relationshipComponent, entity).value as Entity;
      if (entityValue == null) return;
      entity = entityValue;

      if (hasComponent(searchComponent, entity)) return entity;
    }

    return;
  }

  function getOwningPlayer(entity: Entity): Entity | undefined {
    return findEntityWithComponentInRelationshipChain(OwnedBy, entity, Player);
  }

  const storePlayerTotalUnitSnapshot = (playerEntity: Entity) => {
    const matchEntity = getComponentValue(Match, playerEntity)?.matchEntity as Entity | undefined;
    if (!matchEntity) return;

    const turn = getTurnAtTime(matchEntity, clock.currentTime / 1000);
    const playerUnits = [...runQuery([Has(UnitType), HasValue(OwnedBy, { value: playerEntity })])];
    const unitsGroupedByUnitType = playerUnits.reduce((acc, entity) => {
      const unitType = getComponentValue(UnitType, entity)?.value;
      if (unitType === undefined) return acc;
      if (acc[unitType] === undefined) {
        acc[unitType] = 0;
      }
      acc[unitType]++;
      return acc;
    }, {} as Record<number, number>);

    Object.entries(unitsGroupedByUnitType).forEach(([unitType, count]) => {
      setComponent(components.UnitSnapshot, uuid() as Entity, {
        turn,
        createdAtBlock: getCurrentBlockNumber(),
        matchEntity: matchEntity,
        player: playerEntity,
        unitType: Number(unitType),
        count,
      });
    });
  };

  const storePlayerTotalStructureSnapshot = (playerEntity: Entity) => {
    const matchEntity = getComponentValue(Match, playerEntity)?.matchEntity as Entity | undefined;
    if (!matchEntity) return;

    const turn = getTurnAtTime(matchEntity, clock.currentTime / 1000);
    const playerStructures = [...runQuery([Has(StructureType), HasValue(OwnedBy, { value: playerEntity })])];
    const structuresGroupedByStructureType = playerStructures.reduce((acc, entity) => {
      const structureType = getComponentValue(StructureType, entity)?.value;
      if (structureType === undefined) return acc;
      if (acc[structureType] === undefined) {
        acc[structureType] = 0;
      }
      acc[structureType]++;
      return acc;
    }, {} as Record<number, number>);

    Object.entries(structuresGroupedByStructureType).forEach(([structureType, count]) => {
      setComponent(components.StructureSnapshot, uuid() as Entity, {
        turn,
        createdAtBlock: getCurrentBlockNumber(),
        matchEntity: matchEntity,
        player: playerEntity,
        structureType: Number(structureType),
        count,
      });
    });
  };

  const layer = {
    world,
    components,
    networkLayer: network,
    clock,
    utils: {
      getCurrentBlockNumber,
      storePlayerTotalUnitSnapshot,
      storePlayerTotalStructureSnapshot,
      getTurnAtTime,
      getOwningPlayer,
    },
  };

  createPreviousOwnerSystem(layer);

  createUnitBuySystem(layer);
  createUnitKillSystem(layer);
  createMatchEventsSystem(layer);
  createTokenBalanceSystem(layer);

  return layer;
}
