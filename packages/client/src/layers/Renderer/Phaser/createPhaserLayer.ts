import { LocalLayer } from "../../Local";
import {
  createMapSystem,
  createLocalPositionSystem,
  createSetVisualsSystem,
  createAppearanceSystem,
  createSpriteAnimationSystem,
  createHueTintSystem,
  createSelectionSystem,
  createDrawDevHighlightSystem,
  createInputSystem,
  createDrawHighlightCoordSystem,
  createDrawPotentialPathSystem,
  createDrawNextPositionSystem,
  createPlayerSpawnSystem,
  createDrawEntityHeader,
  createDrawAttackableEntitiesSystem,
} from "./systems";
import { createPhaserEngine, tileCoordToPixelCoord } from "phaserx";
import { createPhaserComponents } from "./components";
import { gameConfig } from "./gameConfig";
import {
  ComponentUpdate,
  defineSystem,
  Entity,
  getComponentValue,
  getComponentValueStrict,
  namespaceWorld,
  QueryFragment,
  removeComponent,
  setComponent,
  UpdateType,
} from "@latticexyz/recs";
import { highlightCoord } from "./api";
import { curry } from "lodash";
import { Coord, ValueOf } from "@latticexyz/utils";
import { createConstrainCameraSystem } from "./systems/ConstrainCameraSystem";
import { Animations, Scenes, Sprites, UnitTypeAnimations } from "./phaserConstants";
import { createCombatSystem } from "./systems/CombatSystem";
import { createAnimations } from "./animations";
import { observable } from "mobx";
import { createSmoothCameraControls } from "./camera";
import { RenderDepth } from "./types";
import { createPreferencesSystem } from "./systems/PreferencesSystem";
import { createDrawShadowSystem } from "./systems/DrawShadowSystem";
import { createSounds } from "./createSounds";
import { createTintOnCooldownSystem } from "./systems/TintOnCooldownSystem";
import { createHideBlackBoxSystem } from "./systems/HideBlackBoxSystem";
import { createCaptureAnimationSystem } from "./systems/CaptureAnimationSystem";
import { EmbodiedEntity, GameObjectTypes, WorldCoord } from "phaserx/src/types";
import { createCalculateCombatResultSystem } from "./systems/CalculateCombatResultSystem";
import { Hex } from "viem";
import { UnitTypes } from "../../Network";
import PLAYER_COLORS from "../../Local/player-colors.json";
import { createArrowPainter } from "./createArrowPainter";
import { createDepthSystem } from "./systems/DepthSystem";
import { createSkullSystem } from "./systems/SkullSystem";
import { createShieldSystem } from "./systems/ShieldSystem";
import { createUnitBuildSystem } from "./systems/UnitBuildSystem";
import { createPluginAnalyticsSystem } from "./systems/PluginAnalyticsSystem";

type PhaserEngineConfig = Parameters<typeof createPhaserEngine>[0];

/**
 * The Phaser layer extends the Local layer.
 * Its purpose is to render the state of parent layers to a Phaser world.
 */
export async function createPhaserLayer(local: LocalLayer, phaserConfig: PhaserEngineConfig = gameConfig) {
  const {
    api: { selectEntity, getOwnerColor },
    components: { LocalPosition },
    parentLayers: {
      network: {
        components: { UnitType, OwnedBy },
        utils: { isOwnedByCurrentPlayer, getCurrentPlayerEntity, getTemplateValueStrict },
        api: { buildAt: sendBuildAtTx },
        network: { matchEntity },
      },
      headless: {
        components: { NextPosition, InCurrentMatch },
      },
    },
  } = local;

  // World
  const world = namespaceWorld(local.parentLayers.network.network.world, "phaser");

  const components = createPhaserComponents(world);

  // Create phaser engine
  const { game, scenes, dispose: disposePhaser } = await createPhaserEngine(phaserConfig);
  // game.canvas.hidden = true;
  world.registerDisposer(disposePhaser);

  const sounds = await createSounds(scenes.Main.phaserScene);
  sounds["field-battle"].play();
  // game.canvas.hidden = false;

  game.scene.start(Scenes.UI);
  // Disable zoom on UI
  scenes.UI.camera.zoom$.subscribe(() => {
    scenes.UI.camera.phaserCamera.setZoom(1);
  });

  function selectAndView(entity: Entity) {
    const position = getComponentValue(LocalPosition, entity);
    if (!position) return;

    const {
      Main: {
        camera,
        maps: {
          Main: { tileHeight, tileWidth },
        },
      },
    } = scenes;

    const pixelPosition = tileCoordToPixelCoord(position, tileWidth, tileHeight);
    camera.phaserCamera.pan(pixelPosition.x, pixelPosition.y, 350, Phaser.Math.Easing.Cubic.InOut);
    // Refresh the camera view right before we pan over so there is no visual stutter
    setTimeout(() => {
      camera.setScroll(camera.phaserCamera.scrollX, camera.phaserCamera.scrollY);
      camera.setZoom(camera.phaserCamera.zoom);
    }, 250);

    selectEntity(entity);
  }

  function drawTileHighlight(id: string, position: Coord, color: "red" | "yellow" | "white" | "blue", alpha = 1) {
    const {
      objectPool,
      maps: {
        Main: { tileHeight, tileWidth },
      },
    } = scenes.Main;

    let animation = Animations.TileOutlineWhite;
    if (color === "red") animation = Animations.TileOutlineRed;
    if (color === "yellow") animation = Animations.TileOutlineYellow;
    if (color === "blue") animation = Animations.TileOutlineBlue;

    const object = objectPool.get(id, "Sprite");
    object.setComponent({
      id: `tile-highlight`,
      once: async (box) => {
        const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);
        box.play(animation);
        box.setOrigin(0, 0);
        box.setPosition(pixelCoord.x, pixelCoord.y);
        box.setDepth(RenderDepth.Background1);
        box.setAlpha(alpha);
      },
    });
  }

  function createMapInteractionApi() {
    const disablers = new Set<string>();

    return {
      disableMapInteraction: (id: string) => {
        disablers.add(id);
      },
      enableMapInteraction: (id: string) => {
        disablers.delete(id);
      },
      forceEnableMapInteraction: () => {
        disablers.clear();
      },
      mapInteractionEnabled: () => {
        return disablers.size === 0;
      },
    };
  }

  const findColoredAnimation = (animationKey: Animations, colorName: string) => {
    const {
      config: { animations },
    } = scenes.Main;

    const tintedAnimationKey = `${animationKey}-${colorName}`;
    const tintedAnimation = animations.find((a) => a.key === tintedAnimationKey);

    return tintedAnimation;
  };

  function playTintedAnimation(
    entity: Entity,
    animation: Animations,
    colorName: ValueOf<typeof PLAYER_COLORS>,
    callback?: (gameObject: Phaser.GameObjects.Sprite) => void,
  ) {
    const { objectPool } = scenes.Main;

    const embodiedEntity = objectPool.get(entity, "Sprite");

    const finalAnimation = findColoredAnimation(animation, colorName)?.key ?? animation;
    embodiedEntity.setComponent({
      id: `play-tinted-animation-${entity}`,
      once: (gameObject) => {
        gameObject.play(finalAnimation);
        if (callback) callback(gameObject);
      },
    });

    return finalAnimation;
  }

  function playAnimationWithOwnerColor(
    entity: Entity,
    animation: Animations,
    callback?: (gameObject: Phaser.GameObjects.Sprite) => void,
  ) {
    const color = getOwnerColor(entity, matchEntity);
    return playTintedAnimation(entity, animation, color.name, callback);
  }

  const LARGE_SCREEN_CUTOFF = 1200;
  function isLargeScreen() {
    return window.innerWidth > LARGE_SCREEN_CUTOFF;
  }

  const uiState = observable({
    hideLoading: false,
    map: {
      fullscreen: false,
    },
  });

  let idSequence = 0;
  const uniqueId = (id: string) => {
    return `${id}-${idSequence++}`;
  };

  const defineGameObjectSystem = <Type extends keyof GameObjectTypes>(
    numGameObjects: number,
    gameObjectType: Type,
    query: QueryFragment[],
    system: (update: ComponentUpdate & { type: UpdateType }, gameObjects: EmbodiedEntity<Type>[]) => void,
    idPrefix?: string,
  ) => {
    const _idPrefix = idPrefix ?? uniqueId("game-object");

    defineSystem(world, query, (update) => {
      const { type, entity } = update;

      if (type === UpdateType.Exit) {
        for (let i = 0; i < numGameObjects; i++) {
          scenes.Main.objectPool.remove(`${_idPrefix}-${entity}-${i}`);
        }
        return;
      }

      const gameObjects = [] as EmbodiedEntity<Type>[];
      for (let i = 0; i < numGameObjects; i++) {
        const gameObject = scenes.Main.objectPool.get<Type>(`${_idPrefix}-${entity}-${i}`, gameObjectType);
        gameObjects.push(gameObject as unknown as EmbodiedEntity<Type>);
      }

      system(update, gameObjects);
    });
  };

  const setOriginCenter = (gameObject: Phaser.GameObjects.Sprite) => {
    const animationSize = gameObject.width * gameObject.scaleX;
    const newOrigin = (animationSize - scenes.Main.maps.Main.tileWidth) / (2 * animationSize);
    gameObject.setOrigin(newOrigin);
  };

  function getEntityPixelCoord(entity: Entity) {
    const { tileWidth, tileHeight } = scenes.Main.maps.Main;

    const position = getComponentValueStrict(LocalPosition, entity);
    return tileCoordToPixelCoord(position, tileWidth, tileHeight);
  }

  const drawSpriteAtTile = (
    id: string,
    spriteId: Sprites,
    tileCoord: WorldCoord,
    depth: RenderDepth,
    options?: { depthPosition?: WorldCoord; yOffset?: number; xOffset?: number },
  ) => {
    const {
      objectPool,
      maps: {
        Main: { tileWidth, tileHeight },
      },
      config: { sprites },
    } = scenes.Main;

    const sprite = sprites[spriteId];
    const pixelCoord = tileCoordToPixelCoord(tileCoord, tileWidth, tileHeight);
    const gameObject = objectPool.get(id, "Sprite");

    let spriteObj: Phaser.GameObjects.Sprite;

    gameObject.setComponent({
      id: `draw-sprite-at-tile-${id}`,
      once: (obj) => {
        obj.setOrigin(0, 0);
        obj.setPosition(pixelCoord.x + (options?.xOffset ?? 0), pixelCoord.y + (options?.yOffset ?? 0));
        obj.setDepth(depthFromPosition(options?.depthPosition ?? tileCoord, depth));
        obj.setTexture(sprite.assetKey, sprite.frame);

        spriteObj = obj;
      },
    });

    return spriteObj;
  };

  const drawAnimationAtTile = (id: string, animationId: Animations, tileCoord: WorldCoord, depth: RenderDepth) => {
    const {
      objectPool,
      maps: {
        Main: { tileWidth, tileHeight },
      },
    } = scenes.Main;

    const pixelCoord = tileCoordToPixelCoord(tileCoord, tileWidth, tileHeight);
    const gameObject = objectPool.get(id, "Sprite");

    gameObject.setComponent({
      id: `draw-animation-at-tile-${id}`,
      once: (obj) => {
        obj.setOrigin(0, 0);
        obj.setPosition(pixelCoord.x, pixelCoord.y);
        obj.setDepth(depthFromPosition(tileCoord, depth));
        obj.play(animationId);
      },
    });
  };

  const buildAt = async (builderId: Entity, prototypeId: string, position: WorldCoord) => {
    if (!isOwnedByCurrentPlayer(builderId)) return;

    const currentPlayer = getCurrentPlayerEntity();
    if (!currentPlayer) return;

    const unitType = getTemplateValueStrict(UnitType.id as Hex, prototypeId as Hex).value as UnitTypes;
    const animation = UnitTypeAnimations[unitType];

    const buildGhostEntity = world.registerEntity({ idSuffix: "build-ghost" });
    setComponent(OwnedBy, buildGhostEntity, { value: currentPlayer });
    setComponent(UnitType, buildGhostEntity, { value: unitType });
    setComponent(components.SpriteAnimation, buildGhostEntity, { value: animation });
    setComponent(NextPosition, buildGhostEntity, {
      x: position.x,
      y: position.y,
      userCommittedToPosition: true,
      intendedTarget: undefined,
    });
    setComponent(InCurrentMatch, buildGhostEntity, { value: true });

    try {
      await sendBuildAtTx(builderId, prototypeId as Entity, position);
    } catch (e) {
      console.error(e);
    }

    removeComponent(NextPosition, buildGhostEntity);
    removeComponent(components.SpriteAnimation, buildGhostEntity);
    removeComponent(OwnedBy, buildGhostEntity);
    removeComponent(InCurrentMatch, buildGhostEntity);
  };

  const depthFromPosition = (position: { x: number; y: number }, depth: RenderDepth) => {
    const baseDepth = (position.y + 100) * 10;
    const finalDepth = baseDepth + depth;

    return finalDepth;
  };

  const setDepth = (entity: Entity, depth: RenderDepth) => {
    const position = getComponentValue(LocalPosition, entity);
    if (!position) return;

    const obj = scenes.Main.objectPool.get(entity, "Sprite");
    obj.setComponent({
      id: "depth",
      once: (sprite) => {
        sprite.setDepth(depthFromPosition(position, depth));
      },
    });
  };

  const clearIncomingDamage = (attacker: Entity, defender: Entity) => {
    const incomingDamage = getComponentValue(components.IncomingDamage, defender);
    if (!incomingDamage) return;

    const commitments = incomingDamage.commitments;
    const sources = incomingDamage.sources;
    const values = incomingDamage.values;

    for (let i = 0; i < incomingDamage.sources.length; i++) {
      const source = sources[i];
      const commitment = incomingDamage.commitments[i];

      if (source === attacker && commitment === 1) {
        commitments.splice(i, 1);
        sources.splice(i, 1);
        values.splice(i, 1);
      }
    }

    setComponent(components.IncomingDamage, defender, {
      sources,
      values,
      commitments,
    });
  };

  const arrowPainter = createArrowPainter(scenes.Main);

  // Layer
  const layer = {
    world,
    components,
    sounds,
    parentLayers: {
      ...local.parentLayers,
      local,
    },
    game,
    scenes,
    api: {
      selectAndView,
      drawTileHighlight,
      mapInteraction: createMapInteractionApi(),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      highlightCoord: (_coord: Coord) => {
        "no-op for types";
      },
      findColoredAnimation,
      playTintedAnimation,
      playAnimationWithOwnerColor,
      setOriginCenter,
      getEntityPixelCoord,
      drawSpriteAtTile,
      drawAnimationAtTile,

      depthFromPosition,
      setDepth,

      buildAt,

      arrowPainter,

      clearIncomingDamage,
    },
    animations: createAnimations(playAnimationWithOwnerColor, depthFromPosition, scenes, local),
    ui: {
      isLargeScreen,
    },
    uiState,
    defineGameObjectSystem,
  };
  layer.api.highlightCoord = curry(highlightCoord)(layer);

  // Systems
  createSetVisualsSystem(layer);
  createMapSystem(layer);
  createLocalPositionSystem(layer);
  createAppearanceSystem(layer);
  createSpriteAnimationSystem(layer);
  createHueTintSystem(layer);
  createSelectionSystem(layer);
  createDrawDevHighlightSystem(layer);
  createInputSystem(layer);
  createDrawHighlightCoordSystem(layer);
  createDrawPotentialPathSystem(layer);
  createDrawNextPositionSystem(layer);
  createPlayerSpawnSystem(layer);
  createDrawEntityHeader(layer);
  createDrawAttackableEntitiesSystem(layer);
  createConstrainCameraSystem(layer);
  createCalculateCombatResultSystem(layer);
  createCombatSystem(layer);
  createSmoothCameraControls(layer);
  createPreferencesSystem(layer);
  createDrawShadowSystem(layer);
  createTintOnCooldownSystem(layer);
  createCaptureAnimationSystem(layer);
  createDepthSystem(layer);
  createSkullSystem(layer);
  createShieldSystem(layer);
  createUnitBuildSystem(layer);
  createPluginAnalyticsSystem(layer);

  createHideBlackBoxSystem(layer);

  return layer;
}
