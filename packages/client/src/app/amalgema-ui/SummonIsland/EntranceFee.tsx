import { useEffect, useState } from "react";
import { Body, OverlineSmall } from "../../ui/Theme/SkyStrife/Typography";
import { OrbInput } from "./common";
import { twMerge } from "tailwind-merge";
import { Hex, formatEther } from "viem";
import { useAmalgema } from "../../../useAmalgema";
import { Tooltip } from "react-tooltip";
import { Checkbox } from "../../ui/Theme/SkyStrife/Checkbox";
import { SeasonPassIcon } from "../SeasonPassIcon";

const INITIAL_FEE = 50_000_000_000_000_000_000n;

export function EntranceFee({
  entranceFee,
  setEntranceFee,
  levelId,
  hasSeasonPass,
}: {
  entranceFee: bigint;
  setEntranceFee: (entranceFee: bigint) => void;
  levelId: Hex;
  hasSeasonPass: boolean;
}) {
  const {
    utils: { getLevelSpawns },
  } = useAmalgema();

  const [hasFee, setHasFee] = useState(false);
  const numPlayers = getLevelSpawns(levelId).length;
  const totalFees = BigInt(numPlayers) * entranceFee;

  // Default entrance fee of 50
  useEffect(() => {
    if (hasFee) setEntranceFee(INITIAL_FEE);
  }, [hasFee, setEntranceFee]);

  return (
    <div>
      <OverlineSmall className="text-ss-text-x-light">
        <SeasonPassIcon /> Entrance Fee
      </OverlineSmall>
      <Body className="text-ss-default">Set an entrance fee for each player to pay when joining.</Body>

      <div className="h-4" />

      <div className="w-full flex items-center h-[30px]">
        <div
          className="w-1/2"
          data-tooltip-id="entrance-fee-tooltip"
          data-tooltip-content={`You must own the Season Pass to access this feature.`}
        >
          <Checkbox
            disabled={!hasSeasonPass}
            isChecked={hasFee}
            setIsChecked={(isChecked) => {
              setHasFee(isChecked);
              if (!isChecked) setEntranceFee(BigInt(0));
            }}
            uncheckedLabel="Free Entry"
            checkedLabel="Entrance Fee"
          />
        </div>

        {hasFee && (
          <>
            <div className="w-4" />

            <div className="flex w-1/2">
              <OrbInput className="bg-white" amount={entranceFee} setAmount={setEntranceFee} />
              <div className={twMerge("relative w-full")}>
                <input
                  className={twMerge("w-full bg-ss-bg-2 px-4 py-2 border border-[#DDDAD0]")}
                  type="text"
                  value={`x${numPlayers} = ${formatEther(totalFees)}`}
                  readOnly={true}
                />

                <span className="absolute right-3 top-[8px]">🔮</span>
              </div>
            </div>
          </>
        )}
      </div>

      <Tooltip
        variant="light"
        place="bottom"
        opacity={1}
        style={{
          display: !hasSeasonPass ? "block" : "none",
        }}
        id="entrance-fee-tooltip"
      />
    </div>
  );
}
