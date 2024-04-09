import {
  CallExecutionError,
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  Hex,
  RpcRequestError,
  stringToHex,
} from "viem";
import {
  Entity,
  Has,
  HasValue,
  Not,
  getComponentValue,
  getComponentValueStrict,
  hasComponent,
  runQuery,
  setComponent,
} from "@latticexyz/recs";
import { SkyStrife, env, createSkyStrife } from "../src/createSkyStrife";
import { sleep } from "@latticexyz/utils";
import { encodeSystemCalls } from "@latticexyz/world/internal";
import { BFS } from "client/src/utils/pathfinding";
import lodash from "lodash";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { matchIdFromEntity } from "client/src/matchIdFromEntity";
import { LOBBY_SYSTEM_ID, NAME_SYSTEM_ID, PLAYER_REGISTER_SYSTEM_ID } from "client/src/constants";
import { decodeMatchEntity } from "client/src/decodeMatchEntity";

const { curry, sample } = lodash;

type MatchCoord = { x: number; y: number };

async function createBotPlayer(skyStrife: SkyStrife) {
  const { networkLayer, headlessLayer, createPlayer } = skyStrife;

  let activeMatch: Entity | undefined;
  let activePlayerEntity: Entity | undefined;

  const player = createPlayer(env.PRIVATE_KEY);

  function handleError(e: unknown) {
    if (
      e instanceof ContractFunctionRevertedError ||
      e instanceof CallExecutionError ||
      e instanceof ContractFunctionExecutionError ||
      e instanceof RpcRequestError
    ) {
      console.error(`Error: ${e.shortMessage}`);
    } else {
      console.error(e);
    }
  }

  function matchIsStarted(matchEntity: Entity) {
    const {
      components: { MatchConfig },
    } = networkLayer;

    const matchConfig = getComponentValue(MatchConfig, matchEntity);
    if (!matchConfig) return;

    return matchConfig.startTime !== 0n && matchConfig.startTime < BigInt(Date.now());
  }

  function getMatchPlayerEntity(matchEntity: Entity) {
    const {
      components: { OwnedBy, Match },
    } = networkLayer;

    const playerEntity = [
      ...runQuery([HasValue(OwnedBy, { value: player.entity }), HasValue(Match, { matchEntity })]),
    ][0];
    if (!playerEntity) return;

    return playerEntity;
  }

  function getRandomIntegerInRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function adjacentPositions(position: MatchCoord) {
    return [
      { x: position.x + 1, y: position.y },
      { x: position.x - 1, y: position.y },
      { x: position.x, y: position.y + 1 },
      { x: position.x, y: position.y - 1 },
    ];
  }

  function findEmptySpaceAdjacentToPosition(position: MatchCoord) {
    const {
      components: { Position, Untraversable },
    } = networkLayer;

    for (const adjacentPosition of adjacentPositions(position)) {
      const entitiesAtPosition = [...runQuery([Has(Untraversable), HasValue(Position, adjacentPosition)])];
      if (entitiesAtPosition.length === 0) return adjacentPosition;
    }

    return;
  }

  async function findAndJoinMatch() {
    const {
      components: { MatchConfig, MatchFinished },
      network: { waitForTransaction },
      utils: { getAvailableLevelSpawns },
    } = networkLayer;

    console.log(`Searching for matches to join...`);

    const unstartedMatch = [
      ...runQuery([Has(MatchConfig), Not(MatchFinished), HasValue(MatchConfig, { startTime: 0n })]),
    ];
    if (!unstartedMatch.includes(activeMatch)) {
      activePlayerEntity = getMatchPlayerEntity(activeMatch);
      return;
    }

    const { levelId } = getComponentValueStrict(MatchConfig, activeMatch);
    const spawns = getAvailableLevelSpawns(levelId, activeMatch as Hex);

    const spawnPoint = sample(spawns);
    if (!spawnPoint) return;

    try {
      const hash = await player.worldContract.write.batchCall([
        encodeSystemCalls(IWorldAbi, [
          {
            systemId: PLAYER_REGISTER_SYSTEM_ID,
            functionName: "register",
            args: [activeMatch as Hex, spawnPoint, stringToHex("Halberdier", { size: 32 })],
          },
          {
            systemId: NAME_SYSTEM_ID,
            functionName: "setName",
            args: [`Bot${player.address.slice(0, 6)}`],
          },
          {
            systemId: LOBBY_SYSTEM_ID,
            functionName: "toggleReady",
            args: [activeMatch as Hex],
          },
        ]).map(([systemId, callData]) => ({ systemId, callData })),
      ]);
      await waitForTransaction(hash);
      activePlayerEntity = getMatchPlayerEntity(activeMatch);
    } catch (e) {
      handleError(e);
    }
  }

  async function checkMatchFinished() {
    const {
      components: { MatchFinished },
    } = networkLayer;

    if (!activeMatch) return;

    const matchFinished = getComponentValue(MatchFinished, activeMatch)?.value;
    if (!matchFinished) return;

    activeMatch = undefined;
    activePlayerEntity = undefined;
  }

  async function buildUnit() {
    if (!activePlayerEntity) return;
    if (!activeMatch) return;

    if (!matchIsStarted(activeMatch)) return;

    const {
      components: { OwnedBy, Factory, Position },
      network: { waitForTransaction },
    } = networkLayer;

    const ownedFactories = [
      ...runQuery([HasValue(OwnedBy, { value: decodeMatchEntity(activePlayerEntity).entity }), Has(Factory)]),
    ];
    const factory = ownedFactories[getRandomIntegerInRange(0, ownedFactories.length - 1)];
    if (!factory) return;

    const factoryData = getComponentValueStrict(Factory, factory);
    const prototype = factoryData.prototypeIds[getRandomIntegerInRange(0, factoryData.prototypeIds.length - 1)];
    const factoryPosition = getComponentValueStrict(Position, factory);
    const positionAdjacentToFactory = findEmptySpaceAdjacentToPosition(factoryPosition);

    if (!positionAdjacentToFactory) return;

    console.log(`Building a ${prototype} at ${JSON.stringify(positionAdjacentToFactory)}`);
    try {
      const tx = await player.worldContract.write.build([
        activeMatch,
        decodeMatchEntity(factory).entity,
        prototype as Hex,
        positionAdjacentToFactory,
      ]);
      await waitForTransaction(tx);
    } catch (e) {
      console.error(
        `Player ${player.address} failed to build a ${prototype} at ${JSON.stringify(positionAdjacentToFactory)}`
      );
    }
  }

  async function moveUnit(unitEntity: Entity) {
    if (!activePlayerEntity) return;
    if (!activeMatch) return;

    if (!matchIsStarted(activeMatch)) return;

    const {
      components: { Position, SpawnPoint },
      utils: { getOwningPlayer },
      network: { waitForTransaction },
    } = networkLayer;

    const {
      api: { getMoveSpeed, getMovementDifficulty, isUntraversable, calculateMovementPath, getAttackableEntities },
    } = headlessLayer;

    const moveSpeed = getMoveSpeed(unitEntity);
    if (!moveSpeed) return;

    const unitPosition = getComponentValue(Position, unitEntity);
    if (!unitPosition) return;

    const playerEntity = getOwningPlayer(unitEntity);
    if (playerEntity == null) return;

    const attackableEntities = getAttackableEntities(unitEntity, unitPosition);
    if (attackableEntities && attackableEntities.length > 0) {
      const target = attackableEntities[getRandomIntegerInRange(0, attackableEntities.length - 1)];
      console.log(`Unit ${unitEntity} is attacking ${target}`);
      try {
        const tx = await player.worldContract.write.fight([
          activeMatch,
          decodeMatchEntity(unitEntity).entity,
          decodeMatchEntity(target).entity,
        ]);
        await waitForTransaction(tx);
        return;
      } catch (e) {
        handleError(e);
      }
    }

    const [potentialDestinations] = BFS(
      unitPosition,
      moveSpeed,
      curry(getMovementDifficulty)(Position),
      curry(isUntraversable)(Position, playerEntity)
    );

    for (const destination of potentialDestinations) {
      const attackableEntities = getAttackableEntities(unitEntity, destination);
      if (!attackableEntities || attackableEntities.length === 0) continue;

      let finalTarget = attackableEntities[0];
      // prefer attacking spawn points to end the game quicker

      for (const target of attackableEntities) {
        if (hasComponent(SpawnPoint, target)) {
          console.log("found spawn point");
          finalTarget = target;
          break;
        }
      }
      console.log(
        `Unit ${unitEntity} is attempting to move to ${JSON.stringify(destination)} and attack ${finalTarget}`
      );

      try {
        const path = calculateMovementPath(Position, unitEntity, unitPosition, destination);
        const tx = await player.worldContract.write.moveAndAttack([
          activeMatch,
          decodeMatchEntity(unitEntity).entity,
          path,
          decodeMatchEntity(finalTarget).entity,
        ]);
        await waitForTransaction(tx);
        return;
      } catch (e) {
        handleError(e);
      }
    }

    try {
      const destination = potentialDestinations[getRandomIntegerInRange(0, potentialDestinations.length - 1)];
      const path = calculateMovementPath(Position, unitEntity, unitPosition, destination);

      console.log(`Unit ${unitEntity} is moving a unit to ${JSON.stringify(destination)}`);
      const tx = await player.worldContract.write.move([activeMatch, decodeMatchEntity(unitEntity).entity, path]);
      await waitForTransaction(tx);
    } catch (e) {
      handleError(e);
    }
  }

  async function moveAllUnits() {
    const {
      components: { OwnedBy, UnitType, Position },
    } = networkLayer;

    const {
      components: { InCurrentMatch },
    } = headlessLayer;

    if (!activePlayerEntity) return;

    const allOwnedUnits = [
      ...runQuery([
        Has(UnitType),
        Has(Position),
        Has(InCurrentMatch),
        HasValue(OwnedBy, { value: decodeMatchEntity(activePlayerEntity).entity }),
      ]),
    ];
    for (const unit of allOwnedUnits) {
      await moveUnit(unit);
    }
  }

  async function scopeUnitsToCurrentMatch() {
    // the current system in the headless layer that does this assumes that the network layer is booted fresh with a new match
    // this is difficult to do here so we can do it manually
    if (!activeMatch) return;

    const {
      components: { Match, Untraversable },
    } = networkLayer;

    const {
      components: { InCurrentMatch },
    } = headlessLayer;

    const activeMatchId = matchIdFromEntity(activeMatch);
    const allUnscopedUnitsInMatch = runQuery([
      Has(Untraversable),
      HasValue(Match, { matchEntity: decodeMatchEntity(activeMatch).entity }),
      Not(InCurrentMatch),
    ]);
    for (const unit of allUnscopedUnitsInMatch) {
      console.log(`Scoping unit ${unit} to match ${activeMatchId}`);
      setComponent(InCurrentMatch, unit, { value: true });
    }
  }

  async function start() {
    activeMatch = env.MATCH_ENTITY;
    for (;;) {
      await scopeUnitsToCurrentMatch();

      await findAndJoinMatch();

      await checkMatchFinished();

      await buildUnit();

      await moveAllUnits();

      await sleep(5_000);
    }
  }

  return {
    start,
  };
}

const headlessClient = await createSkyStrife();
const botPlayer = await createBotPlayer(headlessClient);

botPlayer.start();
