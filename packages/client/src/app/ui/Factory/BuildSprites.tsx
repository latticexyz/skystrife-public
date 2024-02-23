import { pixelCoordToTileCoord, tileCoordToPixelCoord } from "phaserx";
import { Entity, removeComponent } from "@latticexyz/recs";
import { Coord, uuid } from "@latticexyz/utils";
import { useEffect, useMemo, useState } from "react";
import { merge } from "rxjs";
import { UnitTypeAnimations } from "../../../layers/Renderer/Phaser/phaserConstants";
import { RenderDepth } from "../../../layers/Renderer/Phaser/types";
import { useMUD } from "../../../useMUD";
import { useCurrentPlayer } from "../hooks/useCurrentPlayer";
import { BuildData } from "./types";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { UNIT_OFFSET } from "../../../layers/Local/constants";
import { UnitTypes } from "../../../layers/Network";

export const BuildSprites = ({
  matchEntity,
  buildData,
  position,
  stopBuilding,
}: {
  matchEntity: Entity;
  position: Coord;
  buildData: BuildData;
  stopBuilding: () => void;
}) => {
  const {
    phaserLayer: {
      components: { HoverHighlight },
      scenes: {
        Main: {
          phaserScene,
          objectPool,
          input,
          maps: {
            Main: { tileWidth, tileHeight },
          },
        },
      },
      api: {
        mapInteraction: { disableMapInteraction, enableMapInteraction },
        drawTileHighlight,
        buildAt,
        playTintedAnimation,
        depthFromPosition,
      },
    },
  } = useMUD();

  const currentPlayer = useCurrentPlayer(matchEntity);

  const [tileHighlightIds, setTileHighlightIds] = useState<string[]>([]);

  const buildPositions = useMemo(
    () => [
      { ...position, x: position.x + 1 },
      { ...position, x: position.x - 1 },
      { ...position, y: position.y + 1 },
      { ...position, y: position.y - 1 },
    ],
    [position]
  );

  useEffect(() => {
    return () => {
      for (let i = 0; i < tileHighlightIds.length; i++) {
        objectPool.remove(tileHighlightIds[i]);
      }
    };
  }, [objectPool, tileHighlightIds]);

  useEffect(() => {
    const unitType = buildData.unitType;
    const spriteAnimation = UnitTypeAnimations[unitType];

    const buildPreviewEntity = uuid() as Entity;
    let sprite: Phaser.GameObjects.Sprite | undefined;
    playTintedAnimation(buildPreviewEntity, spriteAnimation, currentPlayer.playerColor.name, (gameObject) => {
      gameObject.setOrigin(0, 0);
      if (unitType === UnitTypes.Brute) gameObject.setOrigin(0.18, 0.18);
      sprite = gameObject;
    });

    const unitPreviewSub = input.pointermove$.subscribe(({ pointer }) => {
      const tile = pixelCoordToTileCoord(
        {
          x: pointer.worldX,
          y: pointer.worldY,
        },
        tileWidth,
        tileHeight
      );

      if (sprite) {
        sprite.setDepth(depthFromPosition(tile, RenderDepth.UI1));

        const previewPosition = tileCoordToPixelCoord(tile, tileWidth, tileHeight);
        sprite.setPosition(previewPosition.x, previewPosition.y - UNIT_OFFSET);
        if (!buildPositions.find((bp) => bp.x === tile.x && bp.y === tile.y)) {
          sprite.setTint(0x666666);
        } else {
          sprite.clearTint();
        }
      }
    });

    return () => {
      unitPreviewSub.unsubscribe();
      objectPool.remove(buildPreviewEntity);
    };
  }, [
    buildData.unitType,
    buildPositions,
    currentPlayer.playerColor,
    depthFromPosition,
    input.pointermove$,
    objectPool,
    phaserScene.add,
    playTintedAnimation,
    tileHeight,
    tileWidth,
  ]);

  useEffect(() => {
    disableMapInteraction();
    removeComponent(HoverHighlight, singletonEntity);

    for (let i = 0; i < buildPositions.length; i++) {
      setTileHighlightIds((ids) => [...ids, `build-position-${i}`]);
      drawTileHighlight(`build-position-${i}`, buildPositions[i], "yellow");
    }

    const buildClickSub = merge(input.click$, input.rightClick$).subscribe((pointer) => {
      const tile = pixelCoordToTileCoord(
        {
          x: pointer.worldX,
          y: pointer.worldY,
        },
        tileWidth,
        tileHeight
      );
      for (const buildPosition of buildPositions) {
        if (tile.x === buildPosition.x && tile.y === buildPosition.y) {
          buildAt(buildData.factory, buildData.prototypeId, buildPosition);
        }
      }

      stopBuilding();
      enableMapInteraction();
    });

    return () => {
      buildClickSub.unsubscribe();
      enableMapInteraction();
    };
    // literally only run this on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};
