import { Entity, getComponentValue } from "@latticexyz/recs";
import { useAmalgema } from "../../../useAmalgema";
import { ALLOW_LIST_SYSTEM_ID, SEASON_PASS_ONLY_SYSTEM_ID } from "../../../constants";
import { SeasonPassIcon } from "../SeasonPassIcon";
import { MatchPlayers } from "../MatchPlayers";
import { Hex, formatEther, hexToString } from "viem";
import { Button } from "../../ui/Theme/SkyStrife/Button";
import { OrbDisplay } from "./common";
import { JoinModal } from "./JoinModal";
import { CreatedBy } from "../CreatedBy";
import { ConfirmedCheck } from "../../ui/Theme/SkyStrife/Icons/ConfirmedCheck";

export function MatchRow({ matchEntity }: { matchEntity: Entity }) {
  const {
    components: { MatchConfig, MatchSweepstake, MatchName, MatchAccessControl, MatchIndex, OfficialLevel },
    utils: { getMatchRewards },
  } = useAmalgema();

  const matchAccessControl = getComponentValue(MatchAccessControl, matchEntity);
  const matchConfig = getComponentValue(MatchConfig, matchEntity);
  const matchIndex = getComponentValue(MatchIndex, matchEntity)?.matchIndex ?? 0;

  const levelName = hexToString((matchConfig?.levelId ?? "0x") as Hex, { size: 32 });
  const levelOfficial = getComponentValue(OfficialLevel, matchConfig?.levelId as Entity)?.value;
  const matchName = getComponentValue(MatchName, matchEntity)?.value ?? levelName;

  const hasAllowList = matchAccessControl && matchAccessControl.systemId === ALLOW_LIST_SYSTEM_ID;
  const isSeasonPassOnly = matchAccessControl && matchAccessControl.systemId === SEASON_PASS_ONLY_SYSTEM_ID;

  const { totalRewards } = getMatchRewards(matchEntity);
  const totalReward = totalRewards.reduce((acc, reward) => acc + reward.value, 0n);

  const sweepstake = getComponentValue(MatchSweepstake, matchEntity);

  return (
    <div
      key={`${matchEntity}-table-row`}
      className="flex gap-x-8 h-[72px] w-full border-b border-ss-stroke bg-white px-4 items-center text-ss-text-x-light transition-all hover:bg-ss-bg-0"
    >
      <div className="grow min-w-[120px] text-left flex gap-x-2 items-center text-ss-text-default overflow-clip whitespace-nowrap">
        <div className="">
          <div className="flex items-center gap-x-1">
            {isSeasonPassOnly && <SeasonPassIcon />}
            {hasAllowList && <span>🔒</span>}
            {matchName} <span className="text-ss-text-x-light">#{matchIndex}</span>
          </div>
          {matchConfig && <CreatedBy createdBy={matchConfig.createdBy as Hex} />}
        </div>
      </div>

      <div className="w-[100px] text-center shrink-0">
        <MatchPlayers matchEntity={matchEntity} />
      </div>

      <div className="w-[120px] flex items-center gap-x-1 text-center shrink-0">
        {levelOfficial && <ConfirmedCheck />}
        {levelName}
      </div>

      <div className="w-[100px] text-center shrink-0">
        {sweepstake && sweepstake.entranceFee ? (
          <OrbDisplay amount={parseFloat(formatEther(sweepstake?.entranceFee))} />
        ) : (
          <span>-</span>
        )}
      </div>

      <div className="w-[100px] text-center shrink-0">
        <OrbDisplay amount={parseFloat(formatEther(totalReward))} />
      </div>

      <div className="w-[100px] text-center shrink-0">
        <JoinModal matchEntity={matchEntity}>
          <Button buttonType="secondary" className="w-full py-1 px-2">
            open
          </Button>
        </JoinModal>
      </div>
    </div>
  );
}
