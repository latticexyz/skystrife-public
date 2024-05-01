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
import { Animations, Scenes, Sprites, UnitTypeAnimations, UnitTypeDeathAnimations } from "./phaserConstants";
import { createCombatSystem } from "./systems/CombatSystem";
import { observable } from "mobx";
import { createSmoothCameraControls } from "./camera";
import { RenderDepth } from "./types";
import { createPreferencesSystem } from "./systems/PreferencesSystem";
import { createDrawShadowSystem } from "./systems/DrawShadowSystem";
import { createSounds } from "./createSounds";
import { createTintOnCooldownSystem } from "./systems/TintOnCooldownSystem";
import { createCaptureAnimationSystem } from "./systems/CaptureAnimationSystem";
import { WorldCoord } from "phaserx/src/types";
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
import { skystrifeDebug } from "../../../debug";

type PhaserEngineConfig = Parameters<typeof createPhaserEngine>[0];

const debug = skystrifeDebug.extend("phaser-layer");

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
    components: { IncomingDamage },
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

  const ObjectPoolTypes = {
    Sprite: Phaser.GameObjects.Sprite,
    Graphics: Phaser.GameObjects.Graphics,
    Text: Phaser.GameObjects.Text,
    Group: Phaser.GameObjects.Group,
    Rectangle: Phaser.GameObjects.Rectangle,
  } as const;

  const createObjectPool = () => {
    const map = new Map<string, Phaser.GameObjects.GameObject | Phaser.GameObjects.Group>();

    const getSprite = (id: string) => {
      if (!map.has(id)) {
        const sprite = scenes.Main.phaserScene.add.sprite(0, 0, "");
        sprite.setDepth(10);
        sprite.setScale(1, 1);
        sprite.setOrigin(0, 0);
        sprite.setTexture("MainAtlas", "sprites/blank.png");
        sprite.setData("objectPoolId", id);
        map.set(id, sprite);
      }

      return map.get(id);
    };

    const getRect = (id: string) => {
      if (!map.has(id)) {
        const rect = scenes.Main.phaserScene.add.rectangle(0, 0, 0, 0, 0);
        rect.setDepth(10);
        rect.setOrigin(0, 0);
        rect.setFillStyle(0x000000, 1);
        rect.setData("objectPoolId", id);
        map.set(id, rect);
      }

      return map.get(id);
    };

    const getGraphics = (id: string) => {
      if (!map.has(id)) {
        const graphics = scenes.Main.phaserScene.add.graphics();
        map.set(id, graphics);
      }

      return map.get(id);
    };

    const getText = (id: string) => {
      if (!map.has(id)) {
        const text = scenes.Main.phaserScene.add.text(0, 0, "", {});
        map.set(id, text);
      }

      return map.get(id);
    };

    const getGroup = (id: string) => {
      if (!map.has(id)) {
        const group = scenes.Main.phaserScene.add.group();
        map.set(id, group);
      }

      return map.get(id);
    };

    type ObjectPoolTypes = {
      [key in keyof typeof ObjectPoolTypes]: InstanceType<(typeof ObjectPoolTypes)[key]>;
    };

    return {
      get: <objectType extends keyof ObjectPoolTypes>(id: string, type: objectType): ObjectPoolTypes[objectType] => {
        if (type === "Sprite") {
          return getSprite(id) as never;
        } else if (type === "Text") {
          return getText(id) as never;
        } else if (type === "Group") {
          return getGroup(id) as never;
        } else if (type === "Rectangle") {
          return getRect(id) as never;
        } else {
          return getGraphics(id) as never;
        }
      },
      remove: (id: string) => {
        const gameObject = map.get(id);
        if (gameObject) {
          gameObject.destroy(true);
          map.delete(id);
        }
      },
      exists: (id: string) => {
        return map.has(id);
      },
    };
  };

  const globalObjectPool = createObjectPool();

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
      maps: {
        Main: { tileHeight, tileWidth },
      },
    } = scenes.Main;

    let animation = Animations.TileOutlineWhite;
    if (color === "red") animation = Animations.TileOutlineRed;
    if (color === "yellow") animation = Animations.TileOutlineYellow;
    if (color === "blue") animation = Animations.TileOutlineBlue;

    const sprite = globalObjectPool.get(id, "Sprite");
    const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);
    sprite.play(animation);
    sprite.setOrigin(0, 0);
    sprite.setPosition(pixelCoord.x, pixelCoord.y);
    sprite.setDepth(RenderDepth.Background1);
    sprite.setAlpha(alpha);
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
    const sprite = globalObjectPool.get(entity, "Sprite");
    const finalAnimation = findColoredAnimation(animation, colorName)?.key ?? animation;

    sprite.play(finalAnimation);
    if (callback) callback(sprite);

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

  const defineGameObjectSystem = <Type extends keyof typeof ObjectPoolTypes>(
    numGameObjects: number,
    gameObjectType: Type,
    query: QueryFragment[],
    system: (update: ComponentUpdate & { type: UpdateType }, gameObjects: Phaser.GameObjects.GameObject[]) => void,
    idPrefix?: string,
  ) => {
    const _idPrefix = idPrefix ?? uniqueId("game-object");

    defineSystem(world, query, (update) => {
      const { type, entity } = update;

      if (type === UpdateType.Exit) {
        for (let i = 0; i < numGameObjects; i++) {
          globalObjectPool.remove(`${_idPrefix}-${entity}-${i}`);
        }
        return;
      }

      const gameObjects = [];
      for (let i = 0; i < numGameObjects; i++) {
        const gameObject = globalObjectPool.get(`${_idPrefix}-${entity}-${i}`, gameObjectType);
        gameObjects.push(gameObject);
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
      maps: {
        Main: { tileWidth, tileHeight },
      },
      config: { sprites },
    } = scenes.Main;

    const spriteConfig = sprites[spriteId];
    const pixelCoord = tileCoordToPixelCoord(tileCoord, tileWidth, tileHeight);
    const sprite = globalObjectPool.get(id, "Sprite");

    sprite.setOrigin(0, 0);
    sprite.setPosition(pixelCoord.x + (options?.xOffset ?? 0), pixelCoord.y + (options?.yOffset ?? 0));
    sprite.setDepth(depthFromPosition(options?.depthPosition ?? tileCoord, depth));
    sprite.setTexture(spriteConfig.assetKey, spriteConfig.frame);

    return sprite;
  };

  const drawAnimationAtTile = (id: string, animationId: Animations, tileCoord: WorldCoord, depth: RenderDepth) => {
    const {
      maps: {
        Main: { tileWidth, tileHeight },
      },
    } = scenes.Main;

    const pixelCoord = tileCoordToPixelCoord(tileCoord, tileWidth, tileHeight);
    const sprite = globalObjectPool.get(id, "Sprite");
    sprite.setOrigin(0, 0);
    sprite.setPosition(pixelCoord.x, pixelCoord.y);
    sprite.setDepth(depthFromPosition(tileCoord, depth));
    sprite.play(animationId);
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

    const sprite = globalObjectPool.get(entity, "Sprite");
    sprite.setDepth(depthFromPosition(position, depth));
  };

  const clearIncomingDamage = (attacker: Entity, defender: Entity) => {
    const incomingDamage = getComponentValue(IncomingDamage, defender);
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

    setComponent(IncomingDamage, defender, {
      sources,
      values,
      commitments,
    });
  };

  const arrowPainter = createArrowPainter(scenes.Main);

  const playDeathAnimation = (entity: Entity, onDeath: () => void) => {
    const unitType = getComponentValue(UnitType, entity)?.value;
    if (!unitType) {
      onDeath();
      return;
    }

    const deathAnimation = UnitTypeDeathAnimations[unitType];

    const sprite = globalObjectPool.get(entity, "Sprite");
    playAnimationWithOwnerColor(entity, deathAnimation);
    sprite.on(`animationcomplete-${deathAnimation}`, () => {
      onDeath();
    });
  };

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
    animations: {
      playDeathAnimation,
    },
    ui: {
      isLargeScreen,
    },
    uiState,
    defineGameObjectSystem,
    globalObjectPool,
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

  return layer;
}
