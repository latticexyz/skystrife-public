import { Entity, getComponentValue } from "@latticexyz/recs";
import { useAmalgema } from "../../../useAmalgema";
import { ALLOW_LIST_SYSTEM_ID, SEASON_PASS_ONLY_SYSTEM_ID } from "../../../constants";
import { MatchListingContainer } from "./MatchListingContainer";
import { Checkbox } from "../../ui/Theme/SkyStrife/Checkbox";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useSeasonPassExternalWallet } from "../hooks/useSeasonPass";
import { useOrbBalance } from "../hooks/useOrbBalance";
import { MatchRow } from "./MatchRow";
import { useExternalAccount } from "../hooks/useExternalAccount";
import { useSkyKeyHolder } from "../hooks/useHasSkyKey";

export function OpenMatches({ matches }: { matches: Entity[] }) {
  const {
    network: {
      components: { MatchSweepstake, MatchAccessControl, MatchConfig, MatchPlayers },
    },
    components: { AllowList },
  } = useAmalgema();

  const [onlyJoinableMatches, setOnlyJoinableMatches] = useState(true);
  const [showFeeMatches, setShowFeeMatches] = useState(true);
  const [showPrivate, setShowPrivate] = useState(true);

  const hasSeasonPass = useSeasonPassExternalWallet();
  const orbBalance = useOrbBalance();
  const skyKeyHolder = useSkyKeyHolder();

  const { address } = useExternalAccount();

  const matchIsJoinable = useCallback(
    (matchEntity: Entity) => {
      const entranceFee = getComponentValue(MatchSweepstake, matchEntity)?.entranceFee;

      const matchAccessControl = getComponentValue(MatchAccessControl, matchEntity);

      const allowList = getComponentValue(AllowList, matchEntity)?.value;
      const isSeasonPassOnly = matchAccessControl && matchAccessControl.systemId === SEASON_PASS_ONLY_SYSTEM_ID;

      if (address && allowList) {
        const onAllowList = allowList.includes(address);
        if (!onAllowList) return false;
      }

      if (isSeasonPassOnly && !hasSeasonPass) return false;
      if (entranceFee && entranceFee > orbBalance) return false;

      return true;
    },
    [AllowList, MatchAccessControl, MatchSweepstake, address, hasSeasonPass, orbBalance],
  );

  const hasFee = useCallback(
    (matchEntity: Entity) => {
      const entranceFee = getComponentValue(MatchSweepstake, matchEntity)?.entranceFee ?? 0n;
      return entranceFee > 0n;
    },
    [MatchSweepstake],
  );

  const hasAllowList = useCallback(
    (matchEntity: Entity) => {
      const matchAccessControl = getComponentValue(MatchAccessControl, matchEntity);
      if (!matchAccessControl) return;

      const hasAllowList = matchAccessControl.systemId === ALLOW_LIST_SYSTEM_ID;
      return hasAllowList;
    },
    [MatchAccessControl],
  );

  useEffect(() => {
    if (!onlyJoinableMatches) return;

    setShowFeeMatches(true);
    setShowPrivate(true);
  }, [onlyJoinableMatches]);

  const [matchesFiltered, setMatchesFiltered] = useState(0);
  const shownMatches = useMemo(() => {
    setMatchesFiltered(0);

    return matches
      .filter((m) => {
        if (onlyJoinableMatches && !matchIsJoinable(m)) {
          setMatchesFiltered((m) => m + 1);
          return false;
        }
        if (!showFeeMatches && hasFee(m)) {
          setMatchesFiltered((m) => m + 1);
          return false;
        }
        if (!showPrivate && hasAllowList(m)) {
          setMatchesFiltered((m) => m + 1);
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const numPlayersA = getComponentValue(MatchPlayers, a)?.value.length ?? 0;
        const numPlayersB = getComponentValue(MatchPlayers, b)?.value.length ?? 0;

        if (numPlayersA !== numPlayersB) {
          return numPlayersB - numPlayersA;
        }

        const aConfig = getComponentValue(MatchConfig, a);
        const bConfig = getComponentValue(MatchConfig, b);

        if (aConfig?.createdBy === skyKeyHolder.entity) return -1;
        if (bConfig?.createdBy === skyKeyHolder.entity) return 1;

        return 0;
      });
  }, [
    matches,
    onlyJoinableMatches,
    matchIsJoinable,
    showFeeMatches,
    hasFee,
    showPrivate,
    hasAllowList,
    MatchPlayers,
    MatchConfig,
    skyKeyHolder.entity,
  ]);

  return (
    <MatchListingContainer
      allMatches={shownMatches}
      matchRowComponent={MatchRow}
      header={
        <div className="flex gap-x-4 items-center w-full">
          <Checkbox
            isChecked={onlyJoinableMatches}
            setIsChecked={setOnlyJoinableMatches}
            uncheckedLabel="Show All"
            checkedLabel="Show Only Joinable Matches"
          />

          {!onlyJoinableMatches && (
            <>
              <Checkbox
                isChecked={showFeeMatches}
                setIsChecked={setShowFeeMatches}
                uncheckedLabel=""
                checkedLabel="Show Fee Matches"
              />

              <Checkbox
                isChecked={showPrivate}
                setIsChecked={setShowPrivate}
                uncheckedLabel=""
                checkedLabel="Show Private Matches"
              />
            </>
          )}

          <div className="grow" />

          <div className="text-right text-ss-text-x-light">{matchesFiltered} matches hidden.</div>
        </div>
      }
    />
  );
}
