import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { useMUD } from "../../useMUD";
import { Card } from "./Theme/SkyStrife/Card";
import { HasValue, hasComponent } from "@latticexyz/recs";
import { TILE_HEIGHT, TILE_WIDTH } from "../../layers/Renderer/Phaser/phaserConstants";
import { useTileCoordToScreenCoord } from "./hooks/useTileCoordToScreenCoord";
import { singletonEntity } from "@latticexyz/store-sync/recs";

export function PlayerNameHover() {
  const {
    networkLayer: {
      components: { SpawnPoint },
      utils: { getOwningPlayer },
    },
    phaserLayer: {
      components: { HoverHighlight },
      scenes: {
        Main: {
          camera: { phaserCamera },
        },
      },
    },
    localLayer: {
      components: { LocalPosition },
      api: { getPlayerInfo },
    },
  } = useMUD();

  const hoverHighlightLocation = useComponentValue(HoverHighlight, singletonEntity);
  const hoveredEntities = useEntityQuery([
    HasValue(LocalPosition, { x: hoverHighlightLocation?.x, y: hoverHighlightLocation?.y }),
  ]);
  const hoveredSpawn = hoveredEntities.find((entity) => hasComponent(SpawnPoint, entity));
  const owningPlayer = hoveredSpawn ? getOwningPlayer(hoveredSpawn) : null;
  const playerInfo = owningPlayer ? getPlayerInfo(owningPlayer) : null;
  const name = playerInfo ? playerInfo.name : "";

  const screenCoord = useTileCoordToScreenCoord({
    x: hoverHighlightLocation?.x ?? 0,
    y: hoverHighlightLocation?.y ?? 0,
  });

  if (!hoveredSpawn || !name) return <></>;

  return (
    <Card
      style={{
        position: "absolute",
        left: `${screenCoord.x}px`,
        transform: "translate(-45%, 0)",
        top: `${screenCoord.y + TILE_HEIGHT * 1.2}px`,
        maxWidth: `${TILE_WIDTH * phaserCamera.zoom * 2}px`,
        textAlign: "center",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
      }}
      className="px-2 py-1"
    >
      {name}
    </Card>
  );
}
