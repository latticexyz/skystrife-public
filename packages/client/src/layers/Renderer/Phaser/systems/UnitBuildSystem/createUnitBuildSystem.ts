import {
  Has,
  HasValue,
  UpdateType,
  defineSystem,
  getComponentValue,
  getComponentValueStrict,
  removeComponent,
  runQuery,
} from "@latticexyz/recs";
import { PhaserLayer } from "../..";
import { RenderDepth } from "../../types";
import { TILE_HEIGHT, TILE_WIDTH, UnitTypeAnimations } from "../../phaserConstants";
import { tileCoordToPixelCoord } from "phaserx";
import { UNIT_OFFSET } from "../../../../Local/constants";
import { UnitTypes } from "../../../../Network";
import { Subscription, merge } from "rxjs";

export function createUnitBuildSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { BuildingUnit, Position, Untraversable },
        network: { matchEntity },
      },
      local: {
        components: { Selected },
        api: { getOwnerColor },
      },
    },
    api: {
      drawTileHighlight,
      depthFromPosition,
      findColoredAnimation,
      mapInteraction: { enableMapInteraction, disableMapInteraction },
      buildAt,
    },
    scenes: {
      Main: { objectPool, input },
    },
  } = layer;

  let buildClickSub: Subscription | undefined;

  defineSystem(world, [Has(BuildingUnit)], ({ entity: factoryEntity, type }) => {
    buildClickSub?.unsubscribe();
    for (let i = 0; i < 4; i++) {
      objectPool.remove(`unit-build-${i}`);
      objectPool.remove(`unit-build-anim-${i}`);
    }

    if (type === UpdateType.Exit) return;

    const factoryPosition = getComponentValue(Position, factoryEntity);
    if (!factoryPosition) return;

    const buildablePosition = [
      { x: factoryPosition.x + 1, y: factoryPosition.y },
      { x: factoryPosition.x - 1, y: factoryPosition.y },
      { x: factoryPosition.x, y: factoryPosition.y + 1 },
      { x: factoryPosition.x, y: factoryPosition.y - 1 },
    ].filter((pos) => {
      const entityAtPos = [...runQuery([HasValue(Position, pos), Has(Untraversable)])];
      return entityAtPos.length === 0;
    });

    disableMapInteraction("unit-build");

    // the next click, no matter where, ends the build
    buildClickSub = merge(input.click$, input.rightClick$).subscribe((pointer) => {
      removeComponent(BuildingUnit, factoryEntity);
      removeComponent(Selected, factoryEntity);
      enableMapInteraction("unit-build");
    });

    for (let i = 0; i < buildablePosition.length; i++) {
      const buildPosition = buildablePosition[i];
      drawTileHighlight(`unit-build-${i}`, buildPosition, "blue", 1);

      const ownerColor = getOwnerColor(factoryEntity, matchEntity);
      const buildData = getComponentValueStrict(BuildingUnit, factoryEntity);
      const unitType = buildData.unitType;
      const anim = UnitTypeAnimations[unitType];
      const coloredAnim = findColoredAnimation(anim, ownerColor.name);

      const pixelCoord = tileCoordToPixelCoord(buildPosition, TILE_WIDTH, TILE_HEIGHT);

      const animId = `unit-build-anim-${i}`;
      const gameObject = objectPool.get(animId, "Sprite");

      gameObject.setComponent({
        id: `idle-anim`,
        once: (obj) => {
          obj.setOrigin(0, 0);
          if (unitType === UnitTypes.Brute) obj.setOrigin(0.18, 0.18);

          obj.setPosition(pixelCoord.x, pixelCoord.y - UNIT_OFFSET);
          obj.setDepth(depthFromPosition(buildPosition, RenderDepth.Foreground1));
          obj.play(coloredAnim?.key ?? anim);
          obj.setAlpha(0.5);

          obj.setInteractive();
          obj.on("pointerover", () => {
            obj.setAlpha(1);
          });

          obj.on("pointerout", () => {
            obj.setAlpha(0.5);
          });

          obj.on("pointerdown", () => {
            removeComponent(BuildingUnit, factoryEntity);
            removeComponent(Selected, factoryEntity);
            enableMapInteraction("unit-build");

            buildAt(factoryEntity, buildData.prototypeId, buildPosition);
          });
        },
      });
    }
  });
}
