import { useEntityQuery } from "@latticexyz/react";
import { Entity, getComponentValueStrict, Has, HasValue, removeComponent } from "@latticexyz/recs";
import { useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { UnitTypeSprites } from "../../../layers/Renderer/Phaser/phaserConstants";
import { useMUD } from "../../../useMUD";
import { usePlayerGold } from "../hooks/usePlayerGold";
import { ClickWrapper } from "../Theme/ClickWrapper";
import { SpriteImage } from "../Theme/SpriteImage";
import { BuildSprites } from "./BuildSprites";
import { BuildData } from "./types";
import { useCurrentPlayer } from "../hooks/useCurrentPlayer";
import { UnitTypes } from "../../../layers/Network";
import { useTileCoordToScreenCoord } from "../hooks/useTileCoordToScreenCoord";
import { hexToString, Hex } from "viem";
import { decodeMatchEntity } from "../../../decodeMatchEntity";

export const Factory = ({ matchEntity }: { matchEntity: Entity }) => {
  const {
    networkLayer: {
      utils: { getCurrentPlayerEntity },
      network: {
        components: { OwnedBy, Factory },
      },
    },
    localLayer: {
      components: { LocalPosition, Selected },
    },
  } = useMUD();

  const [buildingUnit, setBuildingUnit] = useState<BuildData | null>(null);

  // for performance, don't worry about it
  const selectedAnyFactory = useEntityQuery([Has(Selected), Has(Factory), Has(LocalPosition)])[0];
  const playerEntity = useMemo(() => {
    if (!selectedAnyFactory) return null;
    return getCurrentPlayerEntity();
  }, [getCurrentPlayerEntity, selectedAnyFactory]);

  const selectedFactory = useEntityQuery([
    Has(Selected),
    Has(Factory),
    HasValue(OwnedBy, { value: decodeMatchEntity(playerEntity).entity }),
    Has(LocalPosition),
  ])[0];

  const playerData = useCurrentPlayer(matchEntity);
  const { amount: goldAmount } = usePlayerGold(playerData);

  const factoryPosition = selectedFactory ? getComponentValueStrict(LocalPosition, selectedFactory) : { x: 0, y: 0 };
  const screenPosition = useTileCoordToScreenCoord(factoryPosition);

  useEffect(() => {
    if (selectedFactory) return;

    setBuildingUnit(null);
  }, [selectedFactory]);

  if (!selectedFactory) return <></>;

  const factoryData = getComponentValueStrict(Factory, selectedFactory);
  const buildData = [] as BuildData[];
  if (factoryData) {
    for (let i = 0; i < factoryData.prototypeIds.length; i++) {
      const staminaCost = factoryData.staminaCosts[i];

      const prototypeId = factoryData.prototypeIds[i] as Entity;
      const name = hexToString(prototypeId as Hex, { size: 32 });
      const unitType = UnitTypes[name as keyof typeof UnitTypes];
      buildData.push({ factory: selectedFactory, unitType, staminaCost, prototypeId });
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        top: screenPosition.y,
        left: screenPosition.x,
        display: buildingUnit ? "none" : "block",
      }}
      className="h-fit w-fit"
    >
      {buildingUnit && (
        <BuildSprites
          matchEntity={matchEntity}
          buildData={buildingUnit}
          position={factoryPosition}
          stopBuilding={() => {
            setBuildingUnit(null);
            removeComponent(Selected, selectedFactory);
          }}
        />
      )}
      {!buildingUnit && (
        <ClickWrapper
          style={{ transform: "translateX(-50%)", marginTop: "-10rem" }}
          className="align-center flex flex-row"
        >
          {buildData.map((build, i) => {
            const disabled = build.staminaCost > goldAmount;

            return (
              <div
                key={`${i}-${build.unitType}`}
                onClick={(e) => {
                  if (disabled) return;
                  e.stopPropagation();

                  setBuildingUnit(build);
                }}
                className={twMerge(
                  "align-center ml-2 flex h-fit w-fit cursor-pointer flex-col justify-center rounded border border-solid border-teal-900 bg-teal-800/80 p-3 text-yellow-200 transition-all duration-200 ease-in-out hover:-translate-y-2 hover:border-teal-800/60 hover:bg-teal-800/60 hover:text-yellow-300",
                  disabled && "cursor-not-allowed border-teal-800/40 bg-teal-800/40 text-yellow-200/40"
                )}
              >
                <span
                  style={{
                    fontSmooth: "never",
                  }}
                  className="self-center"
                >
                  {build.staminaCost}
                </span>
                <div
                  style={{
                    opacity: disabled ? 0.4 : 1,
                  }}
                >
                  <SpriteImage
                    spriteKey={UnitTypeSprites[build.unitType]}
                    scale={2}
                    colorName={playerData.playerColor.name}
                  />
                </div>
              </div>
            );
          })}
        </ClickWrapper>
      )}
    </div>
  );
};
