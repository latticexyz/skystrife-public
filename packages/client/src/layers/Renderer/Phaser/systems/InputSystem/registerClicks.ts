import { Entity, Has, HasValue, getComponentValue, hasComponent, runQuery, setComponent } from "@latticexyz/recs";
import { filter, map, merge } from "rxjs";
import { WorldCoord } from "../../../../../types";
import { worldCoordEq } from "../../../../../utils/coords";
import { PhaserLayer } from "../../types";
import { pixelToWorldCoord } from "../../utils";
import { InputUtils } from "./createInputSystem";

export function registerClicks(layer: PhaserLayer, { getSelectedEntity, getHighlightedEntity }: InputUtils) {
  const {
    parentLayers: {
      network: {
        utils: { isOwnedByCurrentPlayer },
        components: { RequiresSetup, BuildingUnit },
      },
      headless: {
        components: { NextPosition, OnCooldown },
        api: { canAttack, attack, calculateMovementPath, getAttackableEntities },
      },
      local: {
        api: { selectArea, resetSelection, move },
        components: { PotentialPath, LocalPosition },
      },
    },
    api: {
      mapInteraction: { mapInteractionEnabled, forceEnableMapInteraction },
    },
    scenes: {
      Main: { input, maps },
    },
    components: { IncomingDamage },
  } = layer;

  const commitIncomingDamage = (attacker: Entity, defender: Entity) => {
    const incomingDamage = getComponentValue(IncomingDamage, defender);
    if (!incomingDamage) return;

    const commitments = incomingDamage.commitments;
    const sources = incomingDamage.sources;

    for (let i = 0; i < incomingDamage.sources.length; i++) {
      const source = sources[i];
      const commitment = incomingDamage.commitments[i];

      if (source === attacker && commitment === 0) {
        commitments[i] = 1;
      }
    }

    setComponent(IncomingDamage, defender, {
      ...incomingDamage,
      commitments,
    });
  };

  const onClick = function (clickedPosition: WorldCoord) {
    const selectedEntity = getSelectedEntity();

    // there are situations where the entity may have died
    // while being selected
    if (selectedEntity && !hasComponent(LocalPosition, selectedEntity)) {
      resetSelection();
      selectArea({ ...clickedPosition, width: 1, height: 1 });
      return;
    }

    // If the player owns the select unit...
    if (selectedEntity && isOwnedByCurrentPlayer(selectedEntity)) {
      const highlightedEntity = getHighlightedEntity();
      const currentPosition = getComponentValue(LocalPosition, selectedEntity);
      if (!currentPosition) return;

      // If the player is hovering over an empty tile
      if (highlightedEntity == null) {
        if (hasComponent(OnCooldown, selectedEntity)) {
          resetSelection();
          selectArea({ ...clickedPosition, width: 1, height: 1 });
          return;
        }

        const nextPosition = getComponentValue(NextPosition, selectedEntity);
        const nextPositionAtClickedPosition = [
          ...runQuery([
            HasValue(NextPosition, {
              x: clickedPosition.x,
              y: clickedPosition.y,
            }),
          ]),
        ][0];

        // Confirm movement location and send tx
        if (nextPosition && nextPosition.userCommittedToPosition && worldCoordEq(clickedPosition, nextPosition)) {
          move(selectedEntity, clickedPosition);
          resetSelection(false);
        } else if (!nextPosition && nextPositionAtClickedPosition) {
          /**
           * no-op
           * there is another unit planning to move to this position
           */
        } else if (
          (!nextPosition || !nextPosition.userCommittedToPosition) &&
          hasComponent(PotentialPath, selectedEntity) &&
          calculateMovementPath(LocalPosition, selectedEntity, currentPosition, clickedPosition).length > 0
        ) {
          setComponent(NextPosition, selectedEntity, {
            ...clickedPosition,
            userCommittedToPosition: true,
            intendedTarget: undefined,
          });

          const attackableEntities = getAttackableEntities(selectedEntity, clickedPosition);
          // If there are no attackable entities, move to the location
          if (
            getComponentValue(RequiresSetup, selectedEntity)?.value ||
            (attackableEntities && attackableEntities.length === 0)
          ) {
            move(selectedEntity, clickedPosition);
            resetSelection(false);
          }
        } else {
          resetSelection();
          selectArea({ ...clickedPosition, width: 1, height: 1 });
        }
      } else {
        /**
         * Triggered when a player clicks a unit.
         *
         * NextPosition values are assigned when the user hovers over enemies.
         * We simply use those here to determine what to do. No need to do any more calculations.
         */
        const nextPosition = getComponentValue(NextPosition, selectedEntity);

        if (nextPosition && !worldCoordEq(nextPosition, currentPosition)) {
          commitIncomingDamage(selectedEntity, highlightedEntity);
          commitIncomingDamage(highlightedEntity, selectedEntity);
          move(selectedEntity, nextPosition, highlightedEntity);
          resetSelection(false);
        } else if (canAttack(selectedEntity, highlightedEntity)) {
          commitIncomingDamage(selectedEntity, highlightedEntity);
          commitIncomingDamage(highlightedEntity, selectedEntity);
          attack(selectedEntity, highlightedEntity);
          resetSelection(false);
        } else {
          resetSelection();
          selectArea({ ...clickedPosition, width: 1, height: 1 });
        }
      }
    } else {
      resetSelection();
      selectArea({ ...clickedPosition, width: 1, height: 1 });
    }
  };

  merge(input.click$, input.rightClick$)
    .pipe(
      filter((pointer) => {
        const clickingCanvas = pointer.event.target instanceof HTMLCanvasElement;

        // unit building is done by clicking directly on the canvas
        // it is an exception where we want to disable map interaction
        // without a UI component
        const unitsBeingBuilt = [...runQuery([Has(BuildingUnit)])].length > 0;
        if (unitsBeingBuilt) return false;

        // in case we end up in a situation where the UI has not
        // properly re-enabled map interaction
        if (clickingCanvas && !mapInteractionEnabled()) forceEnableMapInteraction();

        return clickingCanvas;
      }),
      map((pointer) => ({ x: pointer.worldX, y: pointer.worldY })),
      map((pixel) => pixelToWorldCoord(maps.Main, pixel)),
    )
    .subscribe((coord) => {
      onClick(coord);
    });
}
