import { Entity, Has, getComponentValue, runQuery } from "@latticexyz/recs";
import { useAmalgema } from "../../../useAmalgema";
import { ALLOW_LIST_SYSTEM_ID, SEASON_PASS_ONLY_SYSTEM_ID } from "../../../constants";
import { MatchListingContainer } from "./MatchListingContainer";
import { Checkbox } from "../../ui/Theme/SkyStrife/Checkbox";
import { useMemo, useState } from "react";
import { useSeasonPassExternalWallet } from "../hooks/useSeasonPass";
import { useOrbBalance } from "../hooks/useOrbBalance";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { MatchRow } from "./MatchRow";

export function OpenMatches({ matches }: { matches: Entity[] }) {
  const {
    network: {
      components: { MatchSweepstake, MatchAccessControl, MatchAllowed },
    },
    externalWalletClient,
  } = useAmalgema();

  const [onlyJoinableMatches, setOnlyJoinableMatches] = useState(true);

  const hasSeasonPass = useSeasonPassExternalWallet();
  const orbBalance = useOrbBalance();

  const shownMatches = useMemo(() => {
    if (!onlyJoinableMatches) return matches;

    return matches.filter((matchEntity) => {
      const matchAccessControl = getComponentValue(MatchAccessControl, matchEntity);

      const hasAllowList = matchAccessControl && matchAccessControl.systemId === ALLOW_LIST_SYSTEM_ID;
      const isSeasonPassOnly = matchAccessControl && matchAccessControl.systemId === SEASON_PASS_ONLY_SYSTEM_ID;

      if (hasAllowList) {
        const onAllowList = [...runQuery([Has(MatchAllowed)])]
          .map((entity) => decodeEntity(MatchAllowed.metadata.keySchema, entity))
          .some(
            ({ matchEntity: entity, account }) =>
              externalWalletClient &&
              externalWalletClient.account &&
              entity === matchEntity &&
              account === externalWalletClient.account.address
          );
        if (!onAllowList) return false;
      }

      if (isSeasonPassOnly && !hasSeasonPass) return false;

      const entranceFee = getComponentValue(MatchSweepstake, matchEntity)?.entranceFee;
      if (entranceFee && entranceFee > orbBalance) return false;

      return true;
    });
  }, [
    MatchAccessControl,
    MatchAllowed,
    MatchSweepstake,
    externalWalletClient,
    hasSeasonPass,
    matches,
    onlyJoinableMatches,
    orbBalance,
  ]);

  return (
    <MatchListingContainer
      allMatches={shownMatches}
      matchRowComponent={MatchRow}
      header={
        <Checkbox
          isChecked={onlyJoinableMatches}
          setIsChecked={setOnlyJoinableMatches}
          uncheckedLabel="Show All Matches"
          checkedLabel="Only Joinable"
        />
      }
    />
  );
}
