import { PhaserLayer } from "../../types";
import { pixelToWorldCoord } from "../../utils";
import { filter, map, merge } from "rxjs";
import {
  componentValueEquals,
  defineQuery,
  getComponentValue,
  Has,
  hasComponent,
  HasValue,
  Not,
  removeComponent,
  runQuery,
  setComponent,
  updateComponent,
} from "@latticexyz/recs";
import { WorldCoord } from "../../../../../types";
import { InputUtils } from "./createInputSystem";
import { filterNullish } from "@latticexyz/utils";
import { worldCoordEq } from "../../../../../utils/coords";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { getPositionsWithinRange } from "../../../../../utils/distance";

export function registerHoverIcon(layer: PhaserLayer, { getSelectedEntity }: InputUtils) {
  const {
    scenes: {
      Main: { input, maps, phaserScene },
    },
    components: { HoverHighlight, PreviousHoverHighlight },
    api: {
      highlightCoord,
      mapInteraction: { mapInteractionEnabled },
    },
    parentLayers: {
      network: {
        components: { TerrainType, Position, Combat },
        utils: { isOwnedByCurrentPlayer },
      },
      headless: {
        api: { getMoveAndAttackPath, canAttack },
        components: { NextPosition, OnCooldown },
      },
      local: {
        components: { Selected, LocalPosition, AttackableEntities },
        api: { hasPotentialPath },
      },
    },
  } = layer;

  const setHoverIcon = function (hoveredPosition: WorldCoord) {
    const hoverHighlight = getComponentValue(HoverHighlight, singletonEntity);
    const highlightedEntity =
      hoverHighlight &&
      [...runQuery([HasValue(LocalPosition, { x: hoverHighlight.x, y: hoverHighlight.y }), Not(TerrainType)])][0];

    highlightCoord(hoveredPosition);

    const selectedEntity = getSelectedEntity();
    if (!selectedEntity) {
      input.setCursor("url(public/assets/default-cursor-3.png), auto");
      return;
    }

    if (hasComponent(OnCooldown, selectedEntity)) {
      input.setCursor("url(public/assets/default-cursor-3.png), auto");
      return;
    }

    if (!isOwnedByCurrentPlayer(selectedEntity)) {
      input.setCursor("url(public/assets/default-cursor-3.png), auto");
      return;
    }

    const nextPosition = getComponentValue(NextPosition, selectedEntity);

    const attackableEntities = getComponentValue(AttackableEntities, selectedEntity);
    const hoveredAttackableEntity =
      attackableEntities &&
      attackableEntities.value.find((entity) => worldCoordEq(hoveredPosition, getComponentValue(Position, entity)));

    /**
     * This clause handles setting the NextPosition component depending on the situation.
     * NextPosition is rendered in the DrawNextPositionSystem.
     */
    if (hoveredAttackableEntity) {
      input.setCursor("url(public/assets/attack.png), pointer");

      const currentPosition = getComponentValue(LocalPosition, selectedEntity);
      if (!currentPosition) {
        return;
      }

      const setNextPositionToCurrentLocationAndAssignHoveredEntityAsTarget = () => {
        const newNextPositionData = {
          x: currentPosition.x,
          y: currentPosition.y,
          userCommittedToPosition: false,
          intendedTarget: hoveredAttackableEntity,
        };
        if (componentValueEquals(newNextPositionData, nextPosition)) return;

        setComponent(NextPosition, selectedEntity, newNextPositionData);
      };

      if (nextPosition && nextPosition.userCommittedToPosition) {
        updateComponent(NextPosition, selectedEntity, {
          intendedTarget: hoveredAttackableEntity,
        });
        return;
      }

      const isRangedUnit = (getComponentValue(Combat, selectedEntity)?.maxRange ?? 0) > 1;

      let preferredEndPosition: { x: number; y: number } = currentPosition;
      if (!isRangedUnit) {
        // for non-ranged units, we prefer the last hovered position as the end position for an attack path
        // this is so you can manually set your end path by hovering over a position and then clicking once on an enemy
        // for ranged we ignore this rule since we always attack from a distance
        const previouslyHoveredPosition = getComponentValue(PreviousHoverHighlight, singletonEntity);
        preferredEndPosition = previouslyHoveredPosition ?? currentPosition;
      } else {
        if (canAttack(selectedEntity, hoveredAttackableEntity)) {
          setNextPositionToCurrentLocationAndAssignHoveredEntityAsTarget();
          return;
        }
      }

      // if we intentionally do not want to move when attacking, we can skip the path calculation
      if (worldCoordEq(preferredEndPosition, currentPosition)) {
        const canAttackInMelee = canAttack(selectedEntity, hoveredAttackableEntity);
        if (canAttackInMelee) {
          setNextPositionToCurrentLocationAndAssignHoveredEntityAsTarget();
          return;
        }
      }

      // attempt to calculate the best path to attack
      // before calling getMoveAndAttackPath
      // getMoveAndAttackPath is expensive and we want to avoid calling it if we can
      const cannotMoveToPreferredEndPosition = !hasPotentialPath(selectedEntity, preferredEndPosition);
      if (cannotMoveToPreferredEndPosition) {
        const enemyPosition = getComponentValue(Position, hoveredAttackableEntity);
        if (!enemyPosition) return;

        const combat = getComponentValue(Combat, selectedEntity);
        if (!combat) return;

        const coordsInRangeOfTarget = getPositionsWithinRange(enemyPosition, combat.minRange, combat.maxRange);
        for (const coord of coordsInRangeOfTarget) {
          if (hasPotentialPath(selectedEntity, coord)) {
            preferredEndPosition = coord;
            break;
          }
        }
      }

      // if we make it to here, calculate a move and attack path
      // and show it to the user
      const moveAndAttackPath = getMoveAndAttackPath(
        LocalPosition,
        selectedEntity,
        hoveredAttackableEntity,
        preferredEndPosition,
      );
      // if path calculation fails on preferred position, fall back to attacking from current position
      if (moveAndAttackPath.length === 0) {
        const canAttackInMelee = canAttack(selectedEntity, hoveredAttackableEntity);
        if (canAttackInMelee) {
          setNextPositionToCurrentLocationAndAssignHoveredEntityAsTarget();
          return;
        }
      }

      const newNextPositionData = {
        x: moveAndAttackPath[moveAndAttackPath.length - 1].x,
        y: moveAndAttackPath[moveAndAttackPath.length - 1].y,
        userCommittedToPosition: false,
        intendedTarget: hoveredAttackableEntity,
      };

      if (componentValueEquals(newNextPositionData, nextPosition)) return;

      setComponent(NextPosition, selectedEntity, newNextPositionData);

      return;
    } else if (nextPosition) {
      updateComponent(NextPosition, selectedEntity, {
        intendedTarget: undefined,
      });
    }

    // not hovering over attackable entity, clear the NextPosition
    if (nextPosition && !nextPosition.userCommittedToPosition) {
      removeComponent(NextPosition, selectedEntity);
    }

    const hoveringNextPosition =
      nextPosition && nextPosition.userCommittedToPosition && worldCoordEq(hoveredPosition, nextPosition);

    if (selectedEntity == highlightedEntity && !hoveringNextPosition) {
      input.setCursor("url(public/assets/default-cursor-3.png), auto");
      return;
    }

    if (!nextPosition && (hasPotentialPath(selectedEntity, hoveredPosition) || hoveringNextPosition)) {
      input.setCursor("url(public/assets/move.png), pointer");
      return;
    }

    input.setCursor("url(public/assets/default-cursor-3.png), auto");
  };

  let lastPointerWorldCoord: WorldCoord | undefined;
  const selectedEntityPositionQuery = defineQuery([Has(Selected), Has(Position)]);
  merge(selectedEntityPositionQuery.update$, input.pointermove$)
    .pipe(
      filter(() => mapInteractionEnabled()),
      map(() => {
        if (!phaserScene.input) return { x: 0, y: 0 };

        const pointer = phaserScene.input.activePointer;
        return { x: pointer.worldX, y: pointer.worldY };
      }), // Map pointer to pointer pixel cood
      map((pixel) => {
        const newWorldCoord = pixelToWorldCoord(maps.Main, pixel);

        if (worldCoordEq(newWorldCoord, lastPointerWorldCoord)) {
          return null;
        }

        lastPointerWorldCoord = newWorldCoord;

        return newWorldCoord;
      }), // Map pixel coord to tile coord
      filterNullish(),
    )
    .subscribe((coord) => {
      setHoverIcon(coord);
    });
}
