import {
  setComponent,
  getComponentValue,
  defineComponent,
  Type,
  namespaceWorld,
  runQuery,
  Has,
  removeComponent,
  getComponentValueStrict,
  defineRxSystem,
  HasValue,
  ComponentValue,
  SchemaOf,
  hasComponent,
  defineExitQuery,
  getComponentEntities,
  Entity,
  NotValue,
} from "@latticexyz/recs";
import { HeadlessLayer } from "../Headless";
import {
  defineLocalPositionComponent,
  defineLocalEntityTypeComponent,
  definePathComponent,
  defineSelectionComponent,
  defineSelectedComponent,
  defineSelectableComponent,
} from "./components";
import {
  createPathSystem,
  createSyncSystem,
  createPositionSystem,
  createSelectionSystem,
  createAttackableEntitiesSystem,
  createPositionErrorFallbackSystem,
  createMatchStartSystem,
} from "./systems";
import PLAYER_COLORS from "./player-colors.json";
import { Area, awaitStreamValue, sleep, toEthAddress } from "@latticexyz/utils";
import { createPotentialPathSystem } from "./systems/PotentialPathSystem";
import { concatMap, merge } from "rxjs";
import { Coord } from "phaserx";
import { getClosestTraversablePositionToTarget, manhattan } from "../../utils/distance";
import { WorldCoord } from "../../types";
import { decodeEntity, singletonEntity } from "@latticexyz/store-sync/recs";
import { decodeMatchEntity } from "../../decodeMatchEntity";
import { formatAddress } from "../../app/amalgema-ui/CurrentProfile";
import { Hex } from "viem";
import { encodeMatchEntity } from "../../encodeMatchEntity";
import { createUnitOwnedByCurrentPlayerSystem } from "./systems/UnitOwnedByCurrentPlayerSystem";
import { worldCoordEq } from "../../utils/coords";
import { curry } from "lodash";
import { BFS } from "../../utils/pathfinding";
import { isUntraversable } from "../Network/utils";

/**
 * The Local layer is the thrid layer in the client architecture and extends the Headless layer.
 * Its purpose is to add components and systems for all client-only functionality, eg. strolling imps.
 */
export async function createLocalLayer(headless: HeadlessLayer) {
  const world = namespaceWorld(headless.parentLayers.network.network.world, "local");

  const {
    parentLayers: {
      network: {
        components: {
          Match,
          MatchConfig,
          SpawnReservedBy,
          Player,
          Name,
          Untraversable,
          Range,
          Combat,
          CombatOutcome,
          OwnedBy,
          RequiresSetup,
        },
        utils: { getOwningPlayer, isOwnedByCurrentPlayer, getLevelSpawns },
        network: { matchEntity },
        api: { move: moveApi, moveAndAttack },
      },
    },
    components: headlessComponents,
    api: { calculateMovementPath, getMovementDifficulty, getMoveSpeed },
  } = headless;

  // Components
  const LocalPosition = defineLocalPositionComponent(world);
  const LocalEntityType = defineLocalEntityTypeComponent(world);
  const Path = definePathComponent(world);
  const Selection = defineSelectionComponent(world);
  const Selected = defineSelectedComponent(world);
  const Selectable = defineSelectableComponent(world);

  const PotentialPath = defineComponent(
    world,
    { x: Type.NumberArray, y: Type.NumberArray, costs: Type.NumberArray },
    { id: "PotentialPath" }
  );
  const AttackableEntities = defineComponent(world, { value: Type.EntityArray }, { id: "AttackableEntities" });
  const LocalName = defineComponent(world, { value: Type.String }, { id: "LocalName" });
  const LocalHealth = defineComponent(
    world,
    {
      value: Type.Number,
    },
    { id: "LocalHealth" }
  );
  const DevMode = defineComponent(world, { value: Type.Boolean }, { id: "DevMode" });
  const Alert = defineComponent(world, { on: Type.Entity, type: Type.Number, message: Type.String }, { id: "Alert" });
  const ChoosingTeleportLocation = defineComponent(
    world,
    { teleportee: Type.Entity, entrance: Type.Entity },
    { id: "ChoosingTeleportLocation" }
  );
  const Preferences = defineComponent(
    world,
    {
      showPreferences: Type.Boolean,
      hideTutorial: Type.Boolean,
      muteMusic: Type.Boolean,
      musicVolume: Type.Number,
      disableClouds: Type.Boolean,
      disableBackground: Type.Boolean,
    },
    { id: "Preferences" }
  );
  const UIState = defineComponent(
    world,
    {
      hideLoading: Type.Boolean,
    },
    { id: "UIState" }
  );
  const Interactable = defineComponent(world, { value: Type.Boolean }, { id: "Interactable" });
  const Capturer = defineComponent(world, { value: Type.Entity }, { id: "Capturer" });
  const MatchStarted = defineComponent(world, { value: Type.Boolean }, { id: "MatchStarted" });

  const components = {
    Alert,
    AttackableEntities,
    Capturer,
    ChoosingTeleportLocation,
    DevMode,
    Interactable,
    LocalEntityType,
    LocalHealth,
    LocalName,
    LocalPosition,
    MatchStarted,
    Path,
    PotentialPath,
    Preferences,
    Selectable,
    Selected,
    Selection,
    UIState,
  };

  // Singleton entity
  setComponent(Selection, singletonEntity, { x: 0, y: 0, width: 0, height: 0 });
  setComponent(DevMode, singletonEntity, { value: false });

  // API
  function selectArea(area: Area | undefined) {
    setComponent(Selection, singletonEntity, area ?? { x: 0, y: 0, width: 0, height: 0 });
  }

  function resetSelection(removeNextPosition = true) {
    if (removeNextPosition) {
      const currentlySelectedEntity = [...runQuery([Has(Selected)])][0];
      if (currentlySelectedEntity) removeComponent(headlessComponents.NextPosition, currentlySelectedEntity);
    }

    setComponent(Selection, singletonEntity, { x: 0, y: 0, width: 0, height: 0 });
  }

  function selectEntity(entity: Entity) {
    for (const entity of getComponentEntities(Selected)) {
      removeComponent(headlessComponents.NextPosition, entity);
      removeComponent(Selected, entity);
    }

    if (getComponentValue(Selectable, entity)) setComponent(Selected, entity, { value: true });
  }

  function devModeEnabled() {
    const devMode = getComponentValueStrict(DevMode, singletonEntity);
    return devMode.value;
  }

  function persistPreferences(value: ComponentValue<SchemaOf<typeof Preferences>>) {
    setComponent(Preferences, singletonEntity, value);
    localStorage.setItem("preferences", JSON.stringify(value));
  }

  function getPreferences() {
    const preferencesValue = getComponentValue(Preferences, singletonEntity);
    if (preferencesValue) return preferencesValue;

    const existingPreferences = localStorage.getItem("preferences");
    if (existingPreferences) return JSON.parse(existingPreferences) as ComponentValue<SchemaOf<typeof Preferences>>;

    return {
      hideTutorial: false,
      muteMusic: false,
      showPreferences: false,
      musicVolume: 50,
      disableClouds: false,
      disableBackground: false,
    };
  }

  const prefs = getPreferences();
  if (prefs) setComponent(Preferences, singletonEntity, prefs);

  function getOwnerColor(entity: Entity) {
    const noColor = {
      color: 0xffffff,
      name: "white",
      hex: "ffffff",
    };
    if (matchEntity == null) return noColor;

    const playerEntity = getOwningPlayer(entity);
    if (!playerEntity) return noColor;

    const reservedSpawnPointKeys = Array.from(
      runQuery([HasValue(SpawnReservedBy, { value: decodeMatchEntity(playerEntity).entity })])
    )
      .map((entity) => decodeEntity(SpawnReservedBy.metadata.keySchema, entity))
      .filter((key) => key.matchEntity === matchEntity);
    const reservedSpawnPointKey = reservedSpawnPointKeys[0];
    if (!reservedSpawnPointKey) return noColor;

    const matchConfig = getComponentValue(MatchConfig, matchEntity);
    if (!matchConfig) return noColor;

    const spawnsInMatch = getLevelSpawns(matchConfig.levelId);

    spawnsInMatch.sort();

    const playerIndex = spawnsInMatch.indexOf(reservedSpawnPointKey.index);
    if (playerIndex === -1) return noColor;

    const colorData = Object.entries(PLAYER_COLORS)[playerIndex + 1];
    return {
      color: parseInt(colorData[0], 16),
      name: colorData[1],
      hex: colorData[0],
    };
  }

  const hasPotentialPath = (selectedEntity: Entity, targetPosition: Coord) => {
    if (hasComponent(headlessComponents.OnCooldown, selectedEntity)) return false;

    const blockingEntities = runQuery([HasValue(LocalPosition, targetPosition), Has(Untraversable)]);
    const foundBlockingEntity = blockingEntities.size > 0;
    if (foundBlockingEntity) return false;

    const paths = getComponentValue(PotentialPath, selectedEntity);
    if (!paths || paths.x.length === 0) {
      return false;
    }

    for (let i = 0; i < paths.x.length; i++) {
      if (paths.x[i] == targetPosition.x && paths.y[i] == targetPosition.y) {
        return true;
      }
    }
    return false;
  };

  const canMoveToAndAttack = (attacker: Entity, defender: Entity) => {
    if (hasComponent(RequiresSetup, attacker)) return;

    const attackerOwner = getOwningPlayer(attacker);
    const defenderOwner = getOwningPlayer(defender);
    if (attackerOwner === defenderOwner) return;

    if (!hasComponent(Combat, defender)) return;
    const range = getComponentValue(Range, attacker);
    if (!range) return;

    const minRange = range.min || 1;
    const maxRange = range.max || 1;

    if (hasComponent(headlessComponents.OnCooldown, attacker)) return;

    const closestUnblockedPosition = getClosestTraversablePositionToTarget(
      LocalPosition,
      hasPotentialPath,
      attacker,
      defender,
      minRange,
      maxRange
    );
    if (!closestUnblockedPosition) return;

    return closestUnblockedPosition;
  };

  /**
   * @param callback Called once a Player or Admin initially loads.
   */
  function onAccountLoaded(callback: (data: { playerId: Entity }) => void) {
    const {
      parentLayers: {
        network: {
          network: { playerEntity },
        },
      },
    } = layer;

    let playerLoaded = false;

    defineRxSystem(world, merge(Player.update$, Name.update$), () => {
      if (playerLoaded) return;

      playerLoaded = true;

      callback({
        playerId: playerEntity,
      });
    });
  }

  function getPlayerInfo(player: Entity) {
    const owner = getComponentValue(OwnedBy, player)?.value;
    if (!owner) return;

    const ownerName = getComponentValue(Name, owner as Entity);
    const name = ownerName ? ownerName.value : formatAddress(toEthAddress(owner) as Hex);

    const matchEntity = getComponentValue(Match, player)?.matchEntity;
    if (!matchEntity) return;

    const playerColor = getOwnerColor(player);
    const playerId = player;

    return {
      player,
      playerId,
      name,
      playerColor,
      matchEntity: matchEntity as Entity,
      wallet: toEthAddress(owner),
    };
  }

  /**
   * @param callback Called once a Player and all of their Components are loaded into the game.
   */
  function onPlayerLoaded(
    callback: (data: {
      player: Entity;
      name: string;
      playerId: Entity;
      playerColor: ReturnType<typeof getOwnerColor>;
    }) => void
  ) {
    const {
      parentLayers: {
        network: {
          network: { playerEntity },
        },
      },
    } = layer;

    let playerLoaded = false;

    defineRxSystem(world, merge(Player.update$, Name.update$), () => {
      if (playerLoaded) return;

      const playerData = getPlayerInfo(playerEntity);
      if (!playerData) return;

      playerLoaded = true;
      callback(playerData);
    });
  }

  function startTeleport(entrance: Entity, exit: Entity, teleportee: Entity) {
    setComponent(ChoosingTeleportLocation, exit, {
      teleportee,
      entrance,
    });
  }

  const onCombat = (
    callback: (combatResult: {
      attacker: Entity;
      defender: Entity;
      attackerDamageReceived: number;
      defenderDamageReceived: number;
      attackerDamage: number;
      defenderDamage: number;
      ranged: boolean;
      attackerDied: boolean;
      defenderDied: boolean;
      defenderCaptured: boolean;
    }) => void
  ) => {
    const stoppedMoving$ = defineExitQuery([Has(Path)]);
    const triggerMoveAndAttack$ = merge(CombatOutcome.update$).pipe(
      concatMap(async (update) => {
        const { value } = update;
        const [combatResult] = value;
        if (!combatResult) return;

        const { matchEntity } = decodeMatchEntity(update.entity);
        const attacker = encodeMatchEntity(matchEntity, combatResult.attacker);
        const defender = encodeMatchEntity(matchEntity, combatResult.defender);

        // If unit is still moving, wait until it is finished.
        if (hasComponent(Path, attacker)) {
          const pathRemovedPromise = awaitStreamValue(stoppedMoving$, ({ entity }) => {
            return attacker === entity;
          });
          const fallbackTimeoutPromise = sleep(1_500);
          await Promise.any([pathRemovedPromise, fallbackTimeoutPromise]);
        }

        return {
          attacker,
          defender,
          attackerDamageReceived: combatResult.attackerDamageReceived,
          defenderDamageReceived: combatResult.defenderDamageReceived,
          attackerDamage: combatResult.attackerDamage,
          defenderDamage: combatResult.defenderDamage,
          ranged: combatResult.ranged,
          attackerDied: combatResult.attackerDied,
          defenderDied: combatResult.defenderDied,
          defenderCaptured: combatResult.defenderCaptured,
        };
      })
    );

    defineRxSystem(world, triggerMoveAndAttack$, (combatResult) => {
      if (!combatResult) return;

      callback(combatResult);
    });
  };

  const move = async (entity: Entity, targetPosition: WorldCoord, attackTarget?: Entity) => {
    if (!isOwnedByCurrentPlayer(entity)) return;

    const { NextPosition, OnCooldown } = headlessComponents;

    if (hasComponent(OnCooldown, entity)) {
      console.warn("on cooldown");
      removeComponent(NextPosition, entity);
      return;
    }

    const currentPosition = getComponentValue(LocalPosition, entity);
    if (!currentPosition) {
      console.warn("no current position");
      removeComponent(NextPosition, entity);
      return;
    }

    const path = calculateMovementPath(LocalPosition, entity, currentPosition, targetPosition);
    if (path.length == 0) {
      console.warn("no path found from", currentPosition, "to", targetPosition);
      removeComponent(NextPosition, entity);
      return;
    }

    try {
      attackTarget ? await moveAndAttack(entity, path, attackTarget) : await moveApi(entity, path);
    } catch (e) {
      console.error(e);
      removeComponent(NextPosition, entity);
    }
  };

  const getPotentialPaths = (entity: Entity) => {
    const {
      parentLayers: {
        headless: {
          api: { isUntraversable: isUntraversableHeadless },
        },
      },
    } = layer;

    const moveSpeed = getMoveSpeed(entity);
    if (!moveSpeed) return;

    const localPosition = getComponentValue(LocalPosition, entity);
    if (!localPosition) return;

    const playerEntity = getOwningPlayer(entity) ?? ("0" as Entity);

    const xArray: number[] = [];
    const yArray: number[] = [];

    const [paths, costs] = BFS(
      localPosition,
      moveSpeed,
      curry(getMovementDifficulty)(LocalPosition),
      curry(isUntraversableHeadless)(LocalPosition, playerEntity)
    );

    for (const coord of paths) {
      xArray.push(coord.x);
      yArray.push(coord.y);
    }

    const potentialPaths = {
      x: xArray,
      y: yArray,
      costs: costs,
    };

    return potentialPaths;
  };

  /**
   * Return all entities that are attackable by the given entity.
   * Includes entities that are attackabled with a move and attack action.
   */
  function getAllAttackableEntities(attacker: Entity) {
    const {
      parentLayers: {
        headless: {
          components: { NextPosition },
        },
      },
    } = layer;

    let paths = getComponentValue(PotentialPath, attacker);
    if (!paths) paths = getPotentialPaths(attacker);
    if (!paths) return;

    const currentPosition = getComponentValue(LocalPosition, attacker);
    if (!currentPosition) return;

    const potentialTargetLocations = [];
    for (let i = 0; i < paths.x.length; i++) {
      const target = { x: paths.x[i], y: paths.y[i] };

      const nextPositionAtTarget = [...runQuery([HasValue(NextPosition, target)])].length > 0;
      // make sure the position is not blocked
      if (
        !worldCoordEq(currentPosition, target) &&
        (nextPositionAtTarget || isUntraversable(Untraversable, LocalPosition, target))
      )
        continue;

      potentialTargetLocations.push(target);
    }

    const attackableEntities = new Set<Entity>();

    const owningPlayer = getOwningPlayer(attacker);
    const allEnemyUnits = [...runQuery([Has(LocalPosition), Has(Combat), NotValue(OwnedBy, { value: owningPlayer })])];
    const range = getComponentValue(Range, attacker);
    if (!range) return;

    for (const targetLocation of potentialTargetLocations) {
      for (const enemy of allEnemyUnits) {
        const enemyPosition = getComponentValue(LocalPosition, enemy);
        if (!enemyPosition) continue;

        const distance = manhattan(targetLocation, enemyPosition);
        if (distance <= range.max && distance >= range.min) {
          attackableEntities.add(enemy);
        }
      }
    }

    return [...attackableEntities];
  }

  // Layer
  const layer = {
    world,
    components,
    parentLayers: { ...headless.parentLayers, headless },
    api: {
      startTeleport,
      selectArea,
      selectEntity,
      resetSelection,
      devModeEnabled,
      getOwnerColor,
      onPlayerLoaded,
      onAccountLoaded,

      getPotentialPaths,
      hasPotentialPath,
      canMoveToAndAttack,
      canAttack: headless.api.canAttack,

      persistPreferences,
      getPreferences,

      getPlayerInfo,

      getAllAttackableEntities,

      systemDecoders: {
        onCombat,
      },

      move,
      attack: headless.api.attack,
    },
    singletonEntity,
  };

  // Systems
  createSelectionSystem(layer);
  createSyncSystem(layer);
  createPositionSystem(layer);
  createPathSystem(layer);
  createPotentialPathSystem(layer);
  createAttackableEntitiesSystem(layer);
  createPositionErrorFallbackSystem(layer);
  createMatchStartSystem(layer);
  createUnitOwnedByCurrentPlayerSystem(layer);

  return layer;
}
