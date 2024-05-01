import { Entity } from "@latticexyz/recs";
import { useAmalgema } from "../../../useAmalgema";
import { Hex, stringToHex } from "viem";
import { Tooltip } from "react-tooltip";
import { useMemo } from "react";

export function MapDisplay({ levelId }: { levelId: string }) {
  const {
    utils: { getVirtualLevelData, getLevelSpawns, getLevelPositionStrict, getLevelIndices },
  } = useAmalgema();

  const levelData = useMemo(
    () => (levelId.length > 0 ? getVirtualLevelData(levelId as Entity) : []),
    [getVirtualLevelData, levelId],
  );

  const levelPreview =
    levelData.length > 0
      ? levelData.map((datum, i) => {
          const position = datum.Position;
          if (!position) return null;

          return (
            <div
              style={{
                top: `calc(50% + ${position.y * 8}px)`,
                left: `calc(50% + ${position.x * 8}px)`,
                zIndex: 1,
              }}
              key={`${levelId}-${i}}`}
              className={`absolute h-2 w-2 bg-green-700`}
            ></div>
          );
        })
      : [];

  const levelSpawnIndices = useMemo(
    () => (levelId.length > 0 ? getLevelSpawns(levelId as Entity) : []),
    [levelId, getLevelSpawns],
  );
  const levelSpawnPositions = useMemo(
    () => levelSpawnIndices.map((index) => getLevelPositionStrict(levelId as Hex, index)),
    [levelSpawnIndices, getLevelPositionStrict, levelId],
  );
  levelSpawnPositions.forEach((data) => {
    const position = data as unknown as { x: number; y: number };

    levelPreview.push(
      <div
        style={{
          top: `calc(50% + ${position.y * 8}px)`,
          left: `calc(50% + ${position.x * 8}px)`,
          zIndex: 3,
        }}
        key={`${levelId}-${position.x}-${position.y}`}
        data-tooltip-id="map-legend-tooltip"
        data-tooltip-content={`Player Spawn`}
        className={`absolute h-2 w-2 bg-blue-300 border-blue-500 border`}
      ></div>,
    );
  });

  const levelGoldMineIndices = useMemo(
    () => (levelId.length > 0 ? getLevelIndices(levelId as Entity, stringToHex("GoldMine", { size: 32 })) : []),
    [levelId, getLevelIndices],
  );
  const levelGoldMinePositions = levelGoldMineIndices.map((index) => getLevelPositionStrict(levelId as Hex, index));
  levelGoldMinePositions.forEach((data) => {
    const position = data as unknown as { x: number; y: number };

    levelPreview.push(
      <div
        style={{
          top: `calc(50% + ${position.y * 8}px)`,
          left: `calc(50% + ${position.x * 8}px)`,
          zIndex: 2,
        }}
        data-tooltip-id="map-legend-tooltip"
        data-tooltip-content={`Gold Mine`}
        key={`${levelId}-${position.x}-${position.y}`}
        className={`absolute h-2 w-2 bg-yellow-300 border-yellow-500 border`}
      ></div>,
    );
  });

  return (
    <div className="relative w-full flex justify-cente border border-ss-stroke rounded-md bg-blue-100 h-64 overflow-hidden">
      {levelPreview}

      <Tooltip
        opacity={1}
        style={{ zIndex: 50 }}
        id="map-legend-tooltip"
        variant="light"
        render={({ content }) => {
          return <div>{content}</div>;
        }}
      />
    </div>
  );
}
