import {
  ComponentUpdate,
  defineSystem,
  Entity,
  getComponentValue,
  getComponentValueStrict,
  Has,
  hasComponent,
  HasValue,
  Not,
  NotValue,
  runQuery,
  UpdateType,
} from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { compact, curry, zip } from "lodash";
import { Subscription } from "rxjs";
import { aStar } from "../../../../../utils/pathfinding";
import { PhaserLayer } from "../../types";
import { decodeMatchEntity } from "../../../../../decodeMatchEntity";

export function createDrawPotentialPathSystem(layer: PhaserLayer) {
  const {
    world,
    api: {
      drawTileHighlight,
      arrowPainter: { paintArrowAlongPath },
    },
    components: { HoverHighlight },
    parentLayers: {
      network: {
        components: { OwnedBy, Combat, Action },
        utils: { isOwnedByCurrentPlayer, getOwningPlayer },
      },
      local: {
        components: { PotentialPath, LocalPosition },
      },
      headless: {
        api: { getMovementDifficulty, isUntraversable },
        components: { NextPosition, OnCooldown },
      },
    },
    scenes: {
      Main: { objectPool, phaserScene },
    },
  } = layer;

  function removePathObjects(entity: Entity, paths: { x: number[]; y: number[] }) {
    for (let i = 0; i < paths.x.length; i++) {
      objectPool.remove(`${entity}-path-highlight-${i}`);
    }
  }

  function highlightPotentialPaths(update: ComponentUpdate & { type: UpdateType }) {
    const { entity } = update;

    // idgaf just wipe every path
    removePathObjects(entity, {
      x: Array.from({ length: 250 }, () => 0),
      y: Array.from({ length: 250 }, () => 0),
    });

    if (update.type === UpdateType.Exit) {
      return;
    }

    const potentialPaths = getComponentValue(PotentialPath, entity);

    if (potentialPaths) {
      const currentPlayerEntity = isOwnedByCurrentPlayer(entity);
      const pathColor = !hasComponent(OnCooldown, entity) && currentPlayerEntity ? "yellow" : "white";
      const alpha = currentPlayerEntity ? 1 : 0.5;

      // add current entity position to paths just to look good
      const position = getComponentValue(LocalPosition, entity);
      if (!position) return;
      potentialPaths.x.push(position.x);
      potentialPaths.y.push(position.y);

      for (let i = 0; i < potentialPaths.x.length; i++) {
        const position = { x: potentialPaths.x[i], y: potentialPaths.y[i] };
        drawTileHighlight(`${entity}-path-highlight-${i}`, position, pathColor, alpha);
      }
    }
  }

  defineSystem(world, [Has(PotentialPath), Has(LocalPosition), Not(NextPosition)], (update) => {
    highlightPotentialPaths(update);
  });

  const draw = (from: Coord, to: Coord, player: Entity) => {
    const unitPath = aStar(
      from,
      to,
      100_000,
      curry(getMovementDifficulty)(LocalPosition),
      curry(isUntraversable)(LocalPosition, player),
    );

    unitPath.unshift(from);

    return paintArrowAlongPath("Move", unitPath);
  };

  const entityToPathObjects: Record<
    Entity,
    {
      lines: Phaser.GameObjects.Group | undefined;
      linesNext: Phaser.GameObjects.Group | undefined;
      linesNextBlinkTween: Phaser.Tweens.Tween | undefined;
      pathLineDrawSub: Subscription | undefined;
      pathLineDrawSubNext: Subscription | undefined;
    }
  > = {};

  function initializePathObjects(entity: Entity) {
    if (!entityToPathObjects[entity]) {
      entityToPathObjects[entity] = {
        lines: phaserScene.add.group(),
        linesNext: phaserScene.add.group(),
        linesNextBlinkTween: undefined,
        pathLineDrawSub: undefined,
        pathLineDrawSubNext: undefined,
      };
    }
  }

  // draw movement arrow over hovering position
  defineSystem(world, [Has(PotentialPath), Has(LocalPosition), Not(NextPosition)], ({ entity, type }) => {
    initializePathObjects(entity);
    const pathObjects = entityToPathObjects[entity];

    pathObjects.pathLineDrawSub?.unsubscribe();
    entityToPathObjects[entity].pathLineDrawSub = undefined;
    pathObjects.lines?.clear(true);

    if (!isOwnedByCurrentPlayer(entity)) return;
    if (type === UpdateType.Exit) return;

    const owningPlayer = getOwningPlayer(entity);
    if (!owningPlayer) return;

    const potentialPath = getComponentValue(PotentialPath, entity);
    if (!potentialPath) return;

    entityToPathObjects[entity].lines = phaserScene.add.group();
    entityToPathObjects[entity].pathLineDrawSub = HoverHighlight.update$.subscribe((update) => {
      if (!isOwnedByCurrentPlayer(entity) || hasComponent(OnCooldown, entity)) return;

      entityToPathObjects[entity].lines?.clear(true);

      const unitPosition = getComponentValueStrict(LocalPosition, entity);
      const hoverHighlight = getComponentValue(HoverHighlight, update.entity);

      if (!hoverHighlight) return;

      const hoverCoord = { x: hoverHighlight.x, y: hoverHighlight.y };

      const potentialPathCoords = compact(
        zip(potentialPath.x, potentialPath.y).map(([x, y]) => {
          if (x === undefined || y === undefined) return null;
          return { x, y };
        }),
      );
      const hoveringOverPotentialPath = potentialPathCoords.find(
        ({ x, y }) => x === hoverHighlight.x && y === hoverHighlight.y,
      );
      const hoveredAttackableEntities = [
        ...runQuery([
          HasValue(LocalPosition, hoverCoord),
          Has(Combat),
          NotValue(OwnedBy, { value: decodeMatchEntity(owningPlayer).entity }),
        ]),
      ];

      if (hoveringOverPotentialPath && hoveredAttackableEntities.length === 0) {
        pathObjects.lines = draw(unitPosition, hoverCoord, owningPlayer);
      }
    });
  });

  // draw movement arrow to next position ghost
  defineSystem(world, [Has(LocalPosition), Has(NextPosition)], ({ entity, type }) => {
    initializePathObjects(entity);
    const pathObjects = entityToPathObjects[entity];

    pathObjects.pathLineDrawSubNext?.unsubscribe();
    entityToPathObjects[entity].pathLineDrawSubNext = undefined;
    pathObjects.linesNext?.clear(true);
    pathObjects.linesNextBlinkTween?.destroy();

    const owningPlayer = getOwningPlayer(entity);
    if (!owningPlayer) return;

    if (type === UpdateType.Exit) return;

    entityToPathObjects[entity].linesNext = phaserScene.add.group();

    const unitPosition = getComponentValueStrict(LocalPosition, entity);
    const nextPosition = getComponentValueStrict(NextPosition, entity);

    pathObjects.linesNext = draw(unitPosition, nextPosition, owningPlayer);
  });

  const tweens = {} as Record<Entity, Phaser.Tweens.Tween>;
  Action.update$.subscribe((update) => {
    const [currentValue] = update.value;
    if (!currentValue) return;

    const { entity } = currentValue;
    if (!entity) return;

    if (["pending"].includes(currentValue.status)) {
      const moveArrow = entityToPathObjects[entity]?.linesNext;
      if (moveArrow && !tweens[entity]) {
        const blinkTween = phaserScene.add.tween({
          targets: moveArrow.getChildren(),
          ease: "Linear",
          duration: 250,
          repeat: -1,
          alpha: 0,
          yoyo: true,
        });

        tweens[entity] = blinkTween;
      }
    }

    if (["failed", "completed"].includes(currentValue.status)) {
      if (tweens[entity]) {
        tweens[entity].destroy();
        delete tweens[entity];
      }
    }
  });
}
