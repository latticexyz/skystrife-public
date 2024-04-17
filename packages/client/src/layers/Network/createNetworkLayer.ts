import {
  Entity,
  Has,
  HasValue,
  getComponentValue,
  getComponentValueStrict,
  hasComponent,
  runQuery,
} from "@latticexyz/recs";
import { setup } from "../../mud/setup";
import { BigNumber } from "ethers";
import { WorldCoord } from "phaserx/src/types";
import { manhattan } from "../../utils/distance";
import { Hex } from "viem";
import { NetworkConfig } from "../../mud/utils";
import { decodeEntity, encodeEntity } from "@latticexyz/store-sync/recs";
import { createSystemExecutor } from "./createSystemExecutor";
import { createTransactionCacheSystem } from "./systems/TransactionCacheSystem";
import { TransactionDB } from "./TransactionDB";
import { decodeValue, KeySchema } from "@latticexyz/protocol-parser/internal";
import { hexToResource } from "@latticexyz/common";
import { useStore } from "../../useStore";
import { addressToEntityID } from "../../mud/setupNetwork";
import { encodeSystemCallFrom } from "@latticexyz/world/internal";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { matchIdFromEntity } from "../../matchIdFromEntity";
import { matchIdToEntity } from "../../matchIdToEntity";
import { isDefined } from "@latticexyz/common/utils";
import {
  ALLOW_LIST_SYSTEM_ID,
  BUILD_SYSTEM_ID,
  BYTES32_ZERO,
  EMOJI,
  MOVE_SYSTEM_ID,
  SEASON_PASS_ONLY_SYSTEM_ID,
  SPAWN_SETTLEMENT,
  UNLIMITED_DELEGATION,
} from "../../constants";
import { decodeMatchEntity } from "../../decodeMatchEntity";
import { encodeMatchEntity } from "../../encodeMatchEntity";
import { ANALYTICS_URL } from "./utils";
import { uuid } from "@latticexyz/utils";
import { createJoinableMatchSystem } from "./systems/JoinableMatchSystem";
import lodash from "lodash";

/**
 * The Network layer is the lowest layer in the client architecture.
 * Its purpose is to synchronize the client components with the contract components.
 */
export async function createNetworkLayer(config: NetworkConfig) {
  const { network, components } = await setup(config);
  const { worldContract, matchEntity: currentMatchEntity } = network;
  const currentMatchId = currentMatchEntity ? matchIdFromEntity(currentMatchEntity) : null;

  const isBrowser = typeof window !== "undefined";

  const getAnalyticsConsent = () => {
    if (!isBrowser) return false;

    const consent = localStorage.getItem("analytics-consent");
    if (consent === null) return true;

    return consent === "true";
  };

  const calculateMeanTxResponseTime = () => {
    const allTransactions = [...runQuery([Has(components.Transaction)])];

    return (
      allTransactions.reduce((acc, entity) => {
        const transaction = getComponentValue(components.Transaction, entity);
        if (!transaction || transaction.status !== "completed") return acc;

        const responseTime = Number((transaction.completedTimestamp ?? 0n) - (transaction.submittedTimestamp ?? 0n));
        return acc + responseTime;
      }, 0) /
      (allTransactions.filter((t) => getComponentValue(components.Transaction, t)?.status === "completed").length || 1)
    );
  };

  const { executeSystem, executeSystemWithExternalWallet } = createSystemExecutor({
    worldContract,
    network,
    components,
    sendAnalytics: getAnalyticsConsent(),
    calculateMeanTxResponseTime,
  });

  async function move(entity: Entity, path: WorldCoord[]) {
    if (!currentMatchEntity) return;

    console.log(`Moving entity ${entity} to position (${path[path.length - 1].x}, ${path[path.length - 1].y})}`);

    const finalPoint = path[path.length - 1];

    const { externalWalletClient } = useStore.getState();
    if (!externalWalletClient?.account) return;

    await executeSystem({
      entity,
      systemCall: "callFrom",
      systemId: "Move",
      confirmCompletionCallback: () => {
        return new Promise((resolve) => {
          const sub = components.Position.update$.subscribe((update) => {
            if (update.entity !== entity) return;

            const [val] = update.value;
            const position = val;

            if (position?.x !== finalPoint.x || position?.y !== finalPoint.y) return;

            resolve();
            sub.unsubscribe();
          });
        });
      },
      args: [
        encodeSystemCallFrom({
          abi: IWorldAbi,
          from: externalWalletClient.account.address,
          systemId: MOVE_SYSTEM_ID,
          functionName: "move",
          args: [currentMatchEntity as Hex, decodeMatchEntity(entity).entity, path],
        }),
      ],
    });
  }

  async function attack(attacker: Entity, defender: Entity) {
    if (!currentMatchEntity) return;

    console.log(`Attacking entity ${defender} with entity ${attacker}`);

    const { externalWalletClient } = useStore.getState();
    if (!externalWalletClient?.account) return;

    await executeSystem({
      entity: attacker,
      systemCall: "callFrom",
      systemId: "Attack",
      confirmCompletionCallback: () => {
        return new Promise((resolve) => {
          const sub = components.CombatOutcome.update$.subscribe((update) => {
            if (update.entity !== attacker) return;

            const [val] = update.value;
            const combatResult = val;

            if (encodeMatchEntity(currentMatchEntity, combatResult?.attacker ?? "0x0") !== attacker) return;

            resolve();
            sub.unsubscribe();
          });
        });
      },
      args: [
        encodeSystemCallFrom({
          abi: IWorldAbi,
          from: externalWalletClient.account.address,
          systemId: MOVE_SYSTEM_ID,
          functionName: "fight",
          args: [currentMatchEntity as Hex, decodeMatchEntity(attacker).entity, decodeMatchEntity(defender).entity],
        }),
      ],
    });
  }

  async function moveAndAttack(attacker: Entity, path: WorldCoord[], defender: Entity) {
    if (!currentMatchEntity) return;

    console.log(
      `Moving entity ${attacker} to position (${path[path.length - 1].x}, ${
        path[path.length - 1].y
      }) and attacking entity ${defender}`,
    );

    const { externalWalletClient } = useStore.getState();
    if (!externalWalletClient?.account) return;

    await executeSystem({
      entity: attacker,
      systemCall: "callFrom",
      systemId: "MoveAndAttack",
      confirmCompletionCallback: () => {
        return new Promise((resolve) => {
          const sub = components.CombatOutcome.update$.subscribe((update) => {
            if (update.entity !== attacker) return;

            const [val] = update.value;
            const combatResult = val;

            if (encodeMatchEntity(currentMatchEntity, combatResult?.attacker ?? "0x0") !== attacker) return;

            resolve();
            sub.unsubscribe();
          });
        });
      },
      args: [
        encodeSystemCallFrom({
          abi: IWorldAbi,
          from: externalWalletClient.account.address,
          systemId: MOVE_SYSTEM_ID,
          functionName: "moveAndAttack",
          args: [
            currentMatchEntity as Hex,
            decodeMatchEntity(attacker).entity,
            path,
            decodeMatchEntity(defender).entity,
          ],
        }),
      ],
    });
  }

  async function buildAt(builderId: Entity, prototypeId: Entity, position: WorldCoord) {
    if (!currentMatchEntity) return;

    console.log(`Building prototype ${prototypeId} at ${JSON.stringify(position)}`);

    const { externalWalletClient } = useStore.getState();
    if (!externalWalletClient?.account) return;

    await executeSystem({
      entity: builderId,
      systemCall: "callFrom",
      systemId: "Build",
      args: [
        encodeSystemCallFrom({
          abi: IWorldAbi,
          from: externalWalletClient.account.address,
          systemId: BUILD_SYSTEM_ID,
          functionName: "build",
          args: [
            currentMatchEntity as Hex,
            decodeMatchEntity(builderId).entity,
            prototypeId as Hex,
            { x: position.x, y: position.y },
          ],
        }),
      ],
    });
  }

  async function spawnTemplateAt(
    prototypeId: Entity,
    position: WorldCoord,
    {
      owner,
      matchId: maybeMatchId,
    }: {
      owner?: Entity;
      matchId?: number;
    },
  ) {
    console.log(`Spawning prototype ${prototypeId} at ${JSON.stringify(position)}`);
    const matchId = maybeMatchId ?? currentMatchId ?? -1;
    return await worldContract.write.spawnTemplate([
      matchIdToEntity(matchId),
      prototypeId as Hex,
      owner ? decodeMatchEntity(owner).entity : BYTES32_ZERO,
      { x: position.x, y: position.y },
    ]);
  }

  function getOwningPlayer(entity: Entity): Entity | undefined {
    if (hasComponent(components.Player, entity)) {
      return entity;
    }
    if (hasComponent(components.OwnedBy, entity)) {
      return getComponentValueStrict(components.OwnedBy, entity).value as Entity;
    }
    return;
  }

  function isOwnedBy(entity: Entity, player: Entity) {
    const owningPlayer = getOwningPlayer(entity);
    return owningPlayer && owningPlayer === player;
  }

  function getMatchRewards(matchEntity: Entity) {
    const { MatchReward, MatchConfig, MatchSweepstake } = components;

    const skypoolRewards = [...runQuery([Has(MatchReward)])]
      .map((key) => {
        const { entity, rank } = decodeEntity(MatchReward.metadata.keySchema, key);
        if (entity !== matchEntity) return;

        const { value } = getComponentValueStrict(MatchReward, key);

        const emoji = EMOJI;

        return { rank, value, emoji };
      })
      .filter(isDefined);

    const matchConfig = getComponentValue(MatchConfig, matchEntity);
    const levelSpawns = getLevelSpawns(matchConfig?.levelId ?? "0");

    const matchSweepstake = getComponentValue(MatchSweepstake, matchEntity);
    const entranceFee = matchSweepstake?.entranceFee ?? 0n;
    const totalSweepstakeRewardPool = entranceFee * BigInt(levelSpawns.length);
    const sweepstakeRewards = lodash.times(levelSpawns.length + 1, (i) => {
      const percentage = matchSweepstake?.rewardPercentages[i] ?? 0n;
      const value = (totalSweepstakeRewardPool * percentage) / 100n;

      return { rank: i, value };
    });

    const totalRewards = skypoolRewards.map(({ value }, i) => {
      const sweepstakeReward = sweepstakeRewards[i]?.value ?? 0n;
      return { rank: i, value: value + sweepstakeReward };
    });

    return {
      skypoolRewards,
      sweepstakeRewards,
      totalRewards,
      entranceFee,
    };
  }

  function getMatchAccessDetails(matchEntity: Entity) {
    const matchAccessControl = getComponentValue(components.MatchAccessControl, matchEntity);

    const hasAllowList = matchAccessControl && matchAccessControl.systemId === ALLOW_LIST_SYSTEM_ID;
    const isSeasonPassOnly = matchAccessControl && matchAccessControl.systemId === SEASON_PASS_ONLY_SYSTEM_ID;

    return { hasAllowList, isSeasonPassOnly };
  }

  function getPlayerEntity(
    address: string | undefined,
    matchEntity: Entity | null = currentMatchEntity,
  ): Entity | undefined {
    if (!address) return;
    if (!matchEntity) return;

    const addressEntity = address as Entity;
    const playerEntity = [
      ...runQuery([
        HasValue(components.CreatedByAddress, { value: addressEntity }),
        Has(components.Player),
        HasValue(components.Match, { matchEntity }),
      ]),
    ][0];

    return playerEntity;
  }

  let currentPlayerEntity: Entity | undefined;
  function getCurrentPlayerEntity(): Entity | undefined {
    if (currentPlayerEntity) return currentPlayerEntity;

    const { externalWalletClient } = useStore.getState();

    if (externalWalletClient && externalWalletClient.account) {
      currentPlayerEntity = getPlayerEntity(addressToEntityID(externalWalletClient.account.address));
      return currentPlayerEntity;
    }

    return;
  }

  /**
   * THE PERFORMANCE ON THIS IS FUCKED
   * NEED TO FIND OUT WHY
   */
  function isOwnedByCurrentPlayer(entity: Entity): boolean {
    // Units do not change ownership, so we can calculate
    // and cache the result inside of the UnitOwnedByCurrentPlayerSystem
    const isUnit = hasComponent(components.UnitType, entity);
    const ownedByCurrentPlayerAlreadySet = hasComponent(components.OwnedByCurrentPlayer, entity);
    if (isUnit && ownedByCurrentPlayerAlreadySet) {
      return getComponentValueStrict(components.OwnedByCurrentPlayer, entity).value;
    }

    const x = getCurrentPlayerEntity();
    if (!x) {
      return false;
    }

    const player = decodeEntity(components.Player.metadata.keySchema, x).entity;
    if (player) {
      return Boolean(isOwnedBy(entity, player as Entity));
    }

    return false;
  }

  const findClosest = (entity: Entity, searchEntities: Entity[]) => {
    const closestEntity: {
      distance: number;
      Entity: Entity | null;
    } = {
      distance: Infinity,
      Entity: null,
    };

    const entityPosition = getComponentValue(components.Position, entity);
    if (!entityPosition) return closestEntity;

    for (const searchEntity of searchEntities) {
      const searchPosition = getComponentValue(components.Position, searchEntity);
      if (!searchPosition) continue;

      const distance = manhattan(entityPosition, searchPosition);
      if (distance < closestEntity.distance) {
        closestEntity.distance = distance;
        closestEntity.Entity = searchEntity;
      }
    }

    return closestEntity;
  };

  const getCurrentMatchConfig = () => {
    return currentMatchEntity ? getComponentValue(components.MatchConfig, currentMatchEntity) : undefined;
  };

  const getTurnAtTime = (matchEntity: Entity, time: number) => {
    const matchConfig = getComponentValue(components.MatchConfig, matchEntity);
    if (!matchConfig) return -1;

    const startTime = BigNumber.from(matchConfig.startTime);
    const turnLength = BigNumber.from(matchConfig.turnLength);

    let atTime = BigNumber.from(time);
    if (atTime < startTime) atTime = startTime;

    return atTime.sub(startTime).div(turnLength).toNumber();
  };

  const getTurnAtTimeForCurrentMatch = (time: number) => {
    return currentMatchEntity ? getTurnAtTime(currentMatchEntity, time) : -1;
  };

  const getLevelSpawns = (levelId: string) => {
    return getLevelIndices(levelId, SPAWN_SETTLEMENT);
  };

  const getMaxPlayers = (matchEntity: Entity) => {
    const matchConfig = getComponentValue(components.MatchConfig, matchEntity);
    if (!matchConfig) return 0;

    return getLevelSpawns(matchConfig.levelId).length;
  };

  const getLevelIndices = (levelId: string, templateId: string) => {
    const { LevelTemplates } = components;

    const templateIds = getComponentValue(LevelTemplates, levelId as Entity);

    if (!templateIds) {
      return [];
    }

    const initialValue: bigint[] = [];
    return templateIds.value.reduce(
      (c, _templateId, i) => (_templateId === templateId ? c.concat(BigInt(i)) : c),
      initialValue,
    );
  };

  const getAvailableLevelSpawns = (levelId: string, matchEntity: Hex) => {
    const { SpawnReservedBy } = components;

    return getLevelSpawns(levelId).filter((index) => {
      const reserved = hasComponent(
        SpawnReservedBy,
        encodeEntity(SpawnReservedBy.metadata.keySchema, { matchEntity, index }),
      );

      return !reserved;
    });
  };

  const matchIsLive = (matchEntity: Entity) => {
    const { MatchConfig, MatchFinished } = components;
    if (hasComponent(MatchFinished, matchEntity)) return false;

    const matchConfig = getComponentValue(MatchConfig, matchEntity);
    if (!matchConfig) return false;

    return matchConfig.startTime > 0;
  };

  function decodeData(tableId: Hex, staticData: Hex) {
    const { name } = hexToResource(tableId as Hex);
    const component = components[name as keyof typeof components];

    // Workaround, custom decoding for user-defined types
    return ["TerrainType", "StructureType", "UnitType"].includes(name)
      ? decodeValue({ value: "uint8" }, staticData as Hex)
      : decodeValue((component.metadata as any)?.valueSchema, staticData as Hex);
  }

  function getTemplateValueStrict(tableId: Hex, templateId: Hex) {
    // Workaround, custom key schema for user-defined types
    const keySchema: KeySchema = {
      ...components.TemplateContent.metadata.keySchema,
      tableId: "bytes32",
    };

    const { staticData } = getComponentValueStrict(
      components.TemplateContent,
      encodeEntity(keySchema, { templateId, tableId }),
    );

    return decodeData(tableId, staticData as Hex);
  }

  function getLevelPositionStrict(levelId: Hex, index: bigint) {
    return getComponentValueStrict(
      components.LevelPosition,
      encodeEntity(components.LevelPosition.metadata.keySchema, {
        levelId,
        index,
      }),
    );
  }

  function getLevelDatum(levelId: Hex, index: bigint) {
    const templateId = getComponentValueStrict(components.LevelTemplates, levelId as Entity).value[Number(index)];

    const componentValues: Record<string, any> = {};

    const { value: templateTableIds } = getComponentValueStrict(components.TemplateTables, templateId as Entity);
    templateTableIds.forEach((tableId) => {
      const { name } = hexToResource(tableId as Hex);

      componentValues[name] = getTemplateValueStrict(tableId as Hex, templateId as Hex);
    });

    componentValues["Position"] = getLevelPositionStrict(levelId, index);

    return componentValues;
  }

  // Get the data for all level indices that have a virtual template
  function getVirtualLevelData(levelId: Entity) {
    const { value: templateIds } = getComponentValueStrict(components.LevelTemplates, levelId);

    const initialValue: Record<string, any>[] = [];
    return templateIds.reduce((result, templateId, i) => {
      if (hasComponent(components.VirtualLevelTemplates, templateId as Entity)) {
        result.push(getLevelDatum(levelId as Hex, BigInt(i)));
      }
      return result;
    }, initialValue);
  }

  function hasUnlimitedDelegation(delegator: Hex, delegatee: Hex): boolean {
    return Array.from(runQuery([Has(components.UserDelegationControl)])).some((entity) => {
      const key = decodeEntity((components.UserDelegationControl.metadata as any)?.keySchema, entity);

      const { delegationControlId } = getComponentValueStrict(components.UserDelegationControl, entity);

      return key.delegator === delegator && key.delegatee === delegatee && delegationControlId === UNLIMITED_DELEGATION;
    });
  }

  function hasSystemDelegation(delegator: Hex, delegatee: Hex, systemId: Hex): boolean {
    return Array.from(runQuery([Has(components.SystemboundDelegations)])).some((entity) => {
      const key = decodeEntity(components.SystemboundDelegations.metadata.keySchema, entity);

      return key.delegator === delegator && key.delegatee === delegatee && key.systemId === systemId;
    });
  }

  let sessionId: string | undefined;
  async function sendAnalyticsEvent(eventName: string, data: Record<string, unknown>) {
    if (!getAnalyticsConsent()) return;

    if (!sessionId) {
      sessionId = uuid();
    }

    const chainId = network.networkConfig.chain.id;
    const { address: worldAddress } = worldContract;
    const { externalWalletClient } = useStore.getState();
    const playerAddress = externalWalletClient?.account?.address;

    try {
      await fetch(`${ANALYTICS_URL}/track-client-event/${chainId}/${worldAddress}`, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_name: eventName,
          world_address: worldAddress,
          player_address: playerAddress ?? "",
          session_wallet_address: network.walletClient.account.address,
          data: JSON.stringify({
            ...data,
            session_id: sessionId,
          }),
        }),
      });
    } catch (e) {
      return;
    }

    return;
  }

  const layer = {
    world: network.world,
    network,
    components: {
      ...network.components,
      ...components,
    },

    executeSystem,
    executeSystemWithExternalWallet,

    api: {
      getCurrentMatchConfig,
      move,
      moveAndAttack,
      attack,
      buildAt,

      dev: {
        spawnTemplateAt,
      },
    },
    utils: {
      findClosest,

      getTurnAtTime,
      getTurnAtTimeForCurrentMatch,

      getOwningPlayer,
      isOwnedBy,
      isOwnedByCurrentPlayer,
      getPlayerEntity,
      getCurrentPlayerEntity,

      manhattan,

      getTemplateValueStrict,
      getLevelPositionStrict,
      getLevelIndices,

      getLevelSpawns,
      getAvailableLevelSpawns,
      matchIsLive,
      getMaxPlayers,

      getVirtualLevelData,
      getAnalyticsConsent,

      hasUnlimitedDelegation,
      hasSystemDelegation,

      sendAnalyticsEvent,

      calculateMeanTxResponseTime,

      getMatchRewards,
      getMatchAccessDetails,
    },
    isBrowser,
  };

  const indexedDbAvailable = isBrowser && "indexedDB" in window;
  if (indexedDbAvailable) {
    const txDb = new TransactionDB(network.networkConfig.worldAddress, network.networkConfig.chainId);
    createTransactionCacheSystem(layer, txDb);
  }
  if (!currentMatchEntity) createJoinableMatchSystem(layer);

  return layer;
}
