import { Entity, getComponentValue } from "@latticexyz/recs";
import { useAmalgema } from "../../../useAmalgema";
import { ALLOW_LIST_SYSTEM_ID, SEASON_PASS_ONLY_SYSTEM_ID } from "../../../constants";
import { SeasonPassIcon } from "../SeasonPassIcon";
import { Hex, hexToString } from "viem";
import { CreatedBy, DisplayNameWithLink } from "../CreatedBy";
import { encodeMatchEntity } from "../../../encodeMatchEntity";
import { ConfirmedCheck } from "../../ui/Theme/SkyStrife/Icons/ConfirmedCheck";
import { DateTime } from "luxon";

const PlayerName = ({ entity }: { entity: Entity }) => {
  const {
    components: { CreatedByAddress },
  } = useAmalgema();

  const owner = getComponentValue(CreatedByAddress, entity);

  return <DisplayNameWithLink entity={(owner?.value ?? "") as Entity} />;
};

function MatchRanking({ matchEntity }: { matchEntity: Entity }) {
  const {
    components: { MatchRanking },
  } = useAmalgema();

  const matchRanking = getComponentValue(MatchRanking, matchEntity)?.value ?? [];

  return (
    <div className="w-full flex flex-wrap">
      {matchRanking.map((playerEntity, i) => {
        return (
          <span key={`rank-${i}`} className="w-1/2 flex items-baseline gap-x-1 text-ss-text-default overflow-auto">
            {i + 1} <PlayerName entity={encodeMatchEntity(matchEntity, playerEntity)} />
          </span>
        );
      })}
    </div>
  );
}

export function ViewOnlyMatchRow({ matchEntity }: { matchEntity: Entity }) {
  const {
    components: { MatchConfig, MatchName, MatchAccessControl, MatchIndex, OfficialLevel },
  } = useAmalgema();

  const matchAccessControl = getComponentValue(MatchAccessControl, matchEntity);
  const matchConfig = getComponentValue(MatchConfig, matchEntity);
  const matchIndex = getComponentValue(MatchIndex, matchEntity)?.matchIndex ?? 0;
  const startTime = DateTime.fromSeconds(Number(matchConfig?.startTime ?? 0n));

  const levelId = matchConfig?.levelId ?? "0x";
  const levelName = hexToString(levelId as Hex, { size: 32 });
  const levelOfficial = getComponentValue(OfficialLevel, levelId as Entity)?.value;
  const matchName = getComponentValue(MatchName, matchEntity)?.value ?? levelName;

  const hasAllowList = matchAccessControl && matchAccessControl.systemId === ALLOW_LIST_SYSTEM_ID;
  const isSeasonPassOnly = matchAccessControl && matchAccessControl.systemId === SEASON_PASS_ONLY_SYSTEM_ID;

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

      <div className="w-[120px] flex flex-col text-center shrink-0">
        <span className="text-ss-text-light">{startTime.toLocaleString(DateTime.DATE_SHORT)}</span>
        <span className="text-sm">{startTime.toFormat("h:mm a")}</span>
      </div>

      <div className="w-[120px] flex shrink-0">
        <div className="flex items-center gap-x-1 mx-auto">
          {levelOfficial && <ConfirmedCheck />}
          {levelName}
        </div>
      </div>

      <div className="w-[240px] text-center shrink-0">
        <MatchRanking matchEntity={matchEntity} />
      </div>
    </div>
  );
}
