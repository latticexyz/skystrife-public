import { Entity, Has, HasValue, getComponentValue, removeComponent, runQuery, setComponent } from "@latticexyz/recs";
import { PhaserLayer } from "../Renderer/Phaser";
import * as preact from "preact";
import * as hooks from "preact/hooks";
import * as htm from "htm/preact";
import * as recs from "@latticexyz/recs";
import { manhattan } from "../../utils/distance";
import { WorldCoord } from "phaserx/src/types";
import * as components from "./components";
import { createClientHooks } from "./hooks/createClientHooks";
import { decodeMatchEntity } from "../../decodeMatchEntity";
import { createTileHighlighter } from "./createTileHighlighter";
import { StructureTypes, TerrainTypes, UnitTypes } from "../Network";
import { Hex } from "viem";
import { createTextInput } from "./components/createTextInput";
import { calculateCombatResult as combatResultUtil } from "../Headless/utils/combat";
import { StructureTypeNames, UnitTypeNames } from "../Network/types";

export type PluginLayer = ReturnType<typeof createPluginLayer>;

export function createPluginLayer(phaserLayer: PhaserLayer, namespace: string) {
  const {
    parentLayers: {
      network: {
        components: { Position, OwnedBy, Match, Player, UnitType, StructureType, Factory },
        utils: { isOwnedByCurrentPlayer, getCurrentPlayerEntity },
        network: { matchEntity },
        utils: { getTemplateValueStrict },
      },
      network: networkLayer,
      headless: {
        components: { NextPosition },
        api: { canAttack, attack: sendAttackTx, getCurrentRegen, getCurrentGold },
        turn$,
      },
      local: {
        components: { Selected },
        api: { canMoveToAndAttack, move: sendMoveTx, getAllAttackableEntities, getPlayerInfo },
      },
    },
    scenes: {
      Main: { phaserScene },
    },
    api: { buildAt: phaserBuildAt, selectAndView },
  } = phaserLayer;

  function getCurrentMatchEntity() {
    return matchEntity as Entity;
  }

  function getSelectedEntity(): Entity | undefined {
    return [...runQuery([Has(Selected)])][0];
  }

  function resetSelection() {
    const selectedEntity = getSelectedEntity();
    if (selectedEntity) {
      removeComponent(Selected, selectedEntity);
    }
  }

  function getPosition(entity: Entity | undefined): WorldCoord | undefined {
    if (!entity) return;

    return getComponentValue(Position, entity);
  }

  function getUnitType(entity: Entity | undefined): UnitTypes {
    if (!entity) return UnitTypes.Unknown;

    return getComponentValue(UnitType, entity)?.value ?? UnitTypes.Unknown;
  }

  function isUnit(entity: Entity | undefined): boolean {
    return getUnitType(entity) !== UnitTypes.Unknown;
  }

  function getStructureType(entity: Entity | undefined): StructureTypes {
    if (!entity) return StructureTypes.Unknown;

    return getComponentValue(StructureType, entity)?.value ?? StructureTypes.Unknown;
  }

  function getEntityName(entity: Entity | undefined): string {
    if (!entity) return "Unknown";

    const unitType = getUnitType(entity);
    if (unitType !== UnitTypes.Unknown) {
      return UnitTypeNames[unitType];
    }

    const structureType = getStructureType(entity);
    if (structureType !== StructureTypes.Unknown) {
      return StructureTypeNames[structureType];
    }

    return "Unknown";
  }

  function onNewTurn(callback: (turn: number) => void) {
    return turn$.subscribe(callback);
  }

  function getPlayersInMatch() {
    const allPlayers = [...runQuery([Has(Player), ...(matchEntity ? [HasValue(Match, { matchEntity })] : [])])];
    return allPlayers;
  }

  function getPlayerDetails(entity: Entity) {
    const playerInfo = getPlayerInfo(entity);
    if (!playerInfo) return null;

    return {
      entity,
      name: playerInfo.name,
      color: playerInfo.playerColor,
      walletAddress: playerInfo.wallet,
    };
  }

  function getPlayerGold(playerEntity: Entity) {
    const goldPerTurn = getCurrentRegen(playerEntity);
    const currentGold = getCurrentGold(playerEntity);

    return {
      goldPerTurn,
      currentGold,
    };
  }

  function getAllPlayerEntities(playerEntity: Entity | undefined) {
    if (!matchEntity || !playerEntity) return [];

    const entity = decodeMatchEntity(playerEntity).entity;
    const allUnits = runQuery([
      recs.HasValue(Match, { matchEntity: matchEntity }),
      recs.HasValue(OwnedBy, { value: entity }),
    ]);

    return [...allUnits];
  }

  function getMyFactories() {
    const playerEntity = getCurrentPlayerEntity();
    if (!playerEntity) return [] as Entity[];

    const allEntities = getAllPlayerEntities(playerEntity);
    return allEntities.filter((entity) => getComponentValue(Factory, entity));
  }

  function getMyUnits() {
    const playerEntity = getCurrentPlayerEntity();
    if (!playerEntity) return [] as Entity[];

    const allEntities = getAllPlayerEntities(playerEntity);
    return allEntities.filter((entity) => getComponentValue(UnitType, entity));
  }

  function calculateCombatResult(attacker: Entity, defender: Entity) {
    return combatResultUtil(networkLayer, attacker, defender);
  }

  function createHotkeyManager() {
    const hotkeys = new Map<string, () => void>();

    function addHotkey(key: string, action: () => void) {
      hotkeys.set(key, action);
    }

    function removeHotkey(key: string) {
      hotkeys.delete(key);
    }

    function handleKeyDown(event: KeyboardEvent) {
      const action = hotkeys.get(event.key);
      if (action) {
        action();
      }
    }

    return {
      addHotkey,
      removeHotkey,
      handleKeyDown,
    };
  }

  const hotkeyManager = createHotkeyManager();
  phaserScene.input.keyboard?.on("keydown", hotkeyManager.handleKeyDown);

  /**
   * Attack an entity with an entity you own.
   */
  const attack = (attacker: Entity, defender: Entity) => {
    const attackerPosition = getPosition(attacker);
    if (!attackerPosition) return;

    setComponent(NextPosition, attacker, {
      intendedTarget: defender,
      x: attackerPosition.x,
      y: attackerPosition.y,
      userCommittedToPosition: false,
    });
    sendAttackTx(attacker, defender);
  };

  /**
   * Move an entity to the specified position.
   * Will calculate a proper path to the position.
   * Optionally, you may specify an entity to attack after moving.
   */
  const move = (entity: Entity, targetPosition: WorldCoord, intendedTarget?: Entity) => {
    setComponent(NextPosition, entity, {
      intendedTarget,
      x: targetPosition.x,
      y: targetPosition.y,
      userCommittedToPosition: false,
    });
    sendMoveTx(entity, targetPosition, intendedTarget);
  };

  const buildAt = async (structure: Entity, unitType: UnitTypes, position: WorldCoord) => {
    const factory = getComponentValue(Factory, structure);
    if (!factory) return;

    const prototypes = factory.prototypeIds;
    let prototypeId: string | undefined;
    for (const id of prototypes) {
      const ut = getTemplateValueStrict(UnitType.id as Hex, id as Hex).value as UnitTypes;
      if (ut === unitType) {
        prototypeId = id;
        break;
      }
    }

    if (prototypeId) phaserBuildAt(structure, prototypeId, position);
  };

  return {
    hotkeyManager,
    tileHighlighter: createTileHighlighter(phaserLayer, namespace),
    api: {
      getCurrentMatchEntity,
      selectAndView,
      getSelectedEntity,
      resetSelection,
      getDistanceBetween: manhattan,
      getPosition,
      isOwnedByCurrentPlayer,
      getUnitType,
      isUnit,
      getStructureType,
      getEntityName,

      // combat
      getAllAttackableEntities,
      canAttack,
      canMoveToAndAttack,
      calculateCombatResult,

      // personal player info
      getMyFactories,
      getMyUnits,

      // player info
      getPlayerDetails,
      getPlayerGold,
      getAllPlayerEntities,
      getPlayersInMatch,

      // subscriptions
      onNewTurn,
    },
    actions: {
      attack,
      move,
      buildAt,
    },
    ui: {
      preact: {
        render: preact.render,
        h: preact.h,
        html: htm.html,
        hooks,
        // provided in case a plugin needs to use preact directly
        preact,
        htm,
      },
      components: {
        ...components,
        TextInput: createTextInput(phaserLayer),
      },
      hooks: createClientHooks(phaserLayer),
    },
    types: {
      UnitTypes,
      StructureTypes,
      TerrainTypes,
    },
    recs,
    parentLayers: {
      phaser: phaserLayer,
      headless: phaserLayer.parentLayers.headless,
      local: phaserLayer.parentLayers.local,
      network: phaserLayer.parentLayers.network,
    },
  };
}
