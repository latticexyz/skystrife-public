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
import { StructureTypes, UnitTypes } from "../Network";

export type PluginLayer = ReturnType<typeof createPluginLayer>;

export function createPluginLayer(phaserLayer: PhaserLayer, namespace: string) {
  const {
    parentLayers: {
      network: {
        components: { Position, OwnedBy, Match, Player, UnitType, StructureType },
        utils: { isOwnedByCurrentPlayer },
        network: { matchEntity },
      },
      headless: {
        components: { NextPosition },
        api: { canAttack, attack: sendAttackTx, getCurrentRegen, getCurrentStamina },
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
  } = phaserLayer;

  function getSelectedEntity(): Entity | undefined {
    return [...runQuery([Has(Selected)])][0];
  }

  function resetSelection() {
    const selectedEntity = getSelectedEntity();
    if (selectedEntity) {
      removeComponent(Selected, selectedEntity);
    }
  }

  function getPosition(entity: Entity | undefined) {
    if (!entity) return;

    return getComponentValue(Position, entity);
  }

  function getUnitType(entity: Entity | undefined) {
    if (!entity) return;

    return getComponentValue(UnitType, entity)?.value as UnitTypes | undefined;
  }

  function getStructureType(entity: Entity | undefined) {
    if (!entity) return;

    return getComponentValue(StructureType, entity)?.value as StructureTypes | undefined;
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
      name: playerInfo.name,
      color: playerInfo.playerColor,
      walletAddress: playerInfo.wallet,
    };
  }

  function getPlayerGold(playerEntity: Entity) {
    const goldPerTurn = getCurrentRegen(playerEntity);
    const currentGold = getCurrentStamina(playerEntity);

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

  return {
    hotkeyManager,
    tileHighlighter: createTileHighlighter(phaserLayer, namespace),
    api: {
      getSelectedEntity,
      resetSelection,
      getDistanceBetween: manhattan,
      getPosition,
      isOwnedByCurrentPlayer,
      getUnitType,
      getStructureType,

      // combat
      getAllAttackableEntities,
      canAttack,
      canMoveToAndAttack,

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
      components,
      hooks: createClientHooks(phaserLayer),
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
