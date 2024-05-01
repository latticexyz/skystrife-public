import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import {
  Entity,
  getComponentValueStrict,
  getComponentValue,
  Has,
  HasValue,
  removeComponent,
  setComponent,
} from "@latticexyz/recs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useMUD } from "../../../useMUD";
import { usePlayerGold } from "../hooks/usePlayerGold";
import { ClickWrapper } from "../Theme/ClickWrapper";
import { BuildData } from "./types";
import { useCurrentPlayer } from "../hooks/useCurrentPlayer";
import { UnitTypes } from "../../../layers/Network";
import { useTileCoordToScreenCoord } from "../hooks/useTileCoordToScreenCoord";
import { hexToString, Hex } from "viem";
import { decodeMatchEntity } from "../../../decodeMatchEntity";
import { Portrait } from "../EntityPortrait";
import { Card } from "../Theme/SkyStrife/Card";

const UnitTypeHotkey = {
  [UnitTypes.Swordsman]: "Q",
  [UnitTypes.Pikeman]: "W",
  [UnitTypes.Pillager]: "E",
  [UnitTypes.Archer]: "R",
  [UnitTypes.Knight]: "A",
  [UnitTypes.Brute]: "S",
  [UnitTypes.Catapult]: "D",
} as const;

export const Factory = ({ matchEntity }: { matchEntity: Entity }) => {
  const {
    networkLayer: {
      utils: { getCurrentPlayerEntity },
      components: { BuildingUnit },
      network: {
        components: { OwnedBy, Factory },
      },
    },
    localLayer: {
      components: { LocalPosition, Selected },
    },
    phaserLayer: {
      api: {
        mapInteraction: { enableMapInteraction, disableMapInteraction },
      },
    },
  } = useMUD();

  const [show, setShow] = useState(false);

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

  const buildingUnit = useComponentValue(BuildingUnit, selectedFactory);
  /**
   * BuildUnitSystem handles rendering previews for buildable locations
   * and handles the actual building of units.
   * We just need to set BuildingUnit here.
   */
  const setBuildingUnit = useCallback(
    (unit: BuildData | null) => {
      if (!unit) return;

      setComponent(BuildingUnit, selectedFactory, unit);
    },
    [BuildingUnit, selectedFactory],
  );

  const playerData = useCurrentPlayer(matchEntity);
  const { amount: goldAmount } = usePlayerGold(playerData);

  const factoryPosition = selectedFactory ? getComponentValueStrict(LocalPosition, selectedFactory) : { x: 0, y: 0 };
  const screenPosition = useTileCoordToScreenCoord(factoryPosition);

  const buildData = useMemo(() => {
    if (!selectedFactory) return [];

    const factoryData = getComponentValueStrict(Factory, selectedFactory);
    const data = [] as BuildData[];

    if (factoryData) {
      for (let i = 0; i < factoryData.prototypeIds.length; i++) {
        const goldCost = factoryData.goldCosts[i];

        const prototypeId = factoryData.prototypeIds[i] as Entity;
        const name = hexToString(prototypeId as Hex, { size: 32 });
        const unitType = UnitTypes[name as keyof typeof UnitTypes];
        data.push({ factory: selectedFactory, unitType, goldCost, prototypeId });
      }
    }

    return data;
  }, [Factory, selectedFactory]);

  useEffect(() => {
    if (selectedFactory) {
      disableMapInteraction("factory");
      return;
    }

    enableMapInteraction("factory");
    removeComponent(BuildingUnit, selectedFactory);
  }, [BuildingUnit, disableMapInteraction, enableMapInteraction, selectedFactory, setBuildingUnit]);

  // assign hotkeys
  useEffect(() => {
    const startBuildingUnit = (e: KeyboardEvent) => {
      if (!selectedFactory) return;

      const foundUnit = Object.entries(UnitTypeHotkey).find(([_, hotkey]) => hotkey === e.key.toUpperCase());
      if (!foundUnit) return;

      const unitData = buildData.find((build) => build.unitType === (parseInt(foundUnit[0]) as UnitTypes));
      if (!unitData) return;

      const goldCost = unitData.goldCost;
      if (goldCost > goldAmount) return;

      setBuildingUnit(unitData);
    };

    if (!selectedFactory) {
      setShow(false);
      document.removeEventListener("keydown", startBuildingUnit);
      return;
    }

    const factoryData = getComponentValue(Factory, selectedFactory);
    if (!factoryData) return;

    setTimeout(() => setShow(true), 20);
    document.addEventListener("keydown", startBuildingUnit);

    return () => {
      document.removeEventListener("keydown", startBuildingUnit);
    };
  }, [selectedFactory, BuildingUnit, setBuildingUnit, Factory, goldAmount, buildData]);

  if (!selectedFactory) return <></>;

  let renderDirectionY = "bottom";
  if (screenPosition.y > window.innerHeight / 2) {
    renderDirectionY = "top";
  }

  let renderDirectionX = "right";
  if (screenPosition.x > window.innerWidth / 2) {
    renderDirectionX = "left";
  }

  return (
    <div
      style={{
        position: "absolute",
        opacity: show ? 1 : 0,
        transform: show ? "none" : "translateY(-10%)",
        top: screenPosition.y,
        left: screenPosition.x,
        display: buildingUnit ? "none" : "block",
        zIndex: 50,
        transition: "all 0.2s ease-in-out",
      }}
      className="h-fit w-fit"
    >
      {!buildingUnit && (
        <div
          style={{
            transform: `translate(${renderDirectionX === "left" ? -63 : 0}%, ${
              renderDirectionY === "top" ? -100 : 0
            }%)`,
          }}
          className="align-center flex flex-row flex-wrap w-[400px] gap-y-4"
        >
          {buildData.map((build, i) => {
            const disabled = build.goldCost > goldAmount;

            return (
              <ClickWrapper key={`${i}-${build.unitType}`}>
                <div
                  onClick={(e) => {
                    if (disabled) return;
                    e.stopPropagation();

                    setBuildingUnit(build);
                  }}
                >
                  <Card
                    className={twMerge(
                      "align-center ml-3 flex h-fit w-fit cursor-pointer flex-col justify-center border-none rounded-sm transition-all duration-200 ease-in-out hover:-translate-y-2 ",
                      "p-2",
                      "bg-white/80 hover:bg-ss-gold/90",
                      disabled && "cursor-not-allowed hover:translate-y-0 hover:bg-white/80",
                    )}
                    style={{
                      opacity: disabled ? 0.5 : 1,
                    }}
                  >
                    <span
                      style={{
                        fontSmooth: "never",
                        boxShadow: "1px 1px 0px 0px rgba(24, 23, 16, 0.90)",
                        border: "1px solid #DDDAD0",
                        background: "#FFFFFF",
                      }}
                      className="self-center text-l mb-2 px-2"
                    >
                      {UnitTypeHotkey[build.unitType as keyof typeof UnitTypeHotkey]}
                    </span>

                    <div>
                      <Portrait scale={0.6} unitType={build.unitType} colorName={playerData.playerColor.name} />
                    </div>

                    <div className="h-1" />

                    <span
                      style={{
                        fontSmooth: "never",
                      }}
                      className="self-center text-xl font-medium text-ss-text-default"
                    >
                      {build.goldCost}g
                    </span>
                  </Card>
                </div>
              </ClickWrapper>
            );
          })}
        </div>
      )}
    </div>
  );
};
