import { useMemo } from "react";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue, getComponentValue } from "@latticexyz/recs";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useAmalgema } from "../../../useAmalgema";
import { Hex, hexToString } from "viem";
import { Body, OverlineSmall } from "../../ui/Theme/SkyStrife/Typography";
import { ChevronDown, RequiredAsterisk } from "./common";
import { useEffect } from "react";
import { MapDisplay } from "./MapDisplay";
import { twMerge } from "tailwind-merge";
import { SeasonPassIcon } from "../SeasonPassIcon";
import { ConfirmedCheck } from "../../ui/Theme/SkyStrife/Icons/ConfirmedCheck";

function LevelName({ levelId }: { levelId: Hex }) {
  const {
    network: {
      components: { LevelInSeasonPassRotation, OfficialLevel },
    },
    utils: { getLevelSpawns },
  } = useAmalgema();

  const name = hexToString(levelId, { size: 32 });
  const official = getComponentValue(OfficialLevel, levelId as Entity)?.value;

  const seasonPassOnly = useComponentValue(LevelInSeasonPassRotation, levelId as Entity);
  const numSpawns = useMemo(() => getLevelSpawns(levelId as Entity).length, [getLevelSpawns, levelId]);

  return (
    <div className="flex flex-row items-center">
      {seasonPassOnly && seasonPassOnly.value ? (
        <>
          <SeasonPassIcon />
          <div className="w-1" />
        </>
      ) : null}
      {official && (
        <>
          <ConfirmedCheck />
          <div className="w-1" />
        </>
      )}
      <span className="font-bold">{name}</span> &nbsp;({numSpawns} players)
    </div>
  );
}

export function ChooseLevel({
  levelId,
  setLevelId,
  setRewardPercentages,
  hasSeasonPass,
}: {
  setLevelId: (levelId: string) => void;
  levelId: string;
  setRewardPercentages: (rewardPercentages: bigint[]) => void;
  hasSeasonPass: boolean;
}) {
  const {
    network: {
      components: { LevelTemplates, LevelInStandardRotation, LevelInSeasonPassRotation },
    },
    utils: { getLevelSpawns },
  } = useAmalgema();

  const standardLevels = useEntityQuery([Has(LevelTemplates), HasValue(LevelInStandardRotation, { value: true })]);
  const seasonPassLevels = useEntityQuery([Has(LevelTemplates), HasValue(LevelInSeasonPassRotation, { value: true })]);
  const levels = standardLevels.concat(seasonPassLevels);

  useEffect(() => {
    if (levelId.length === 0) return;

    const numPlayers = getLevelSpawns(levelId as Entity).length;

    const percentages = Array(numPlayers).fill(0n);
    percentages.push(0n); // last one is for match creator
    setRewardPercentages(percentages);
  }, [getLevelSpawns, levelId, setRewardPercentages]);

  return (
    <div>
      <OverlineSmall className="w-full text-left text-ss-text-x-light">
        Map Selection
        <RequiredAsterisk />
      </OverlineSmall>

      <Body className="text-ss-text-default">Select a map for players to compete on.</Body>

      <div className="h-3" />

      <div>
        <div style={{ zIndex: 1200 }} className="relative">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="w-full">
              <div className="w-full p-2 border rounded-md bg-white text-ss-text-default">
                <LevelName levelId={levelId as Hex} />
              </div>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.RadioGroup value={levelId} onValueChange={setLevelId}>
                {levels.map((id) => {
                  const seasonPassLevel = Boolean(seasonPassLevels.find((level) => level === id));

                  return (
                    <DropdownMenu.RadioItem
                      key={id}
                      disabled={seasonPassLevel && !hasSeasonPass}
                      value={id}
                      className={twMerge(
                        `w-96 p-2 border rounded-md text-ss-text-default`,
                        id === levelId ? "bg-ss-blue-hover" : "bg-white",
                        seasonPassLevel && !hasSeasonPass ? "bg-gray-200 text-gray-400" : "hover:bg-ss-blue-hover",
                      )}
                    >
                      <LevelName levelId={id as Hex} />
                    </DropdownMenu.RadioItem>
                  );
                })}
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          <div className="h-4" />

          <div className="absolute right-4 top-[14px]">
            <ChevronDown />
          </div>
        </div>

        <MapDisplay levelId={levelId} />
      </div>
    </div>
  );
}
