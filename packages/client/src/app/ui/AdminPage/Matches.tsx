import { useState } from "react";
import { useAmalgema } from "../../../useAmalgema";
import { Entity, Has, Not, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { CreateMatch } from "./CreateMatch";
import { Button } from "../Theme/SkyStrife/Button";
import { Hex, hexToString } from "viem";
import { MatchNumber } from "../MatchNumber";
import { getMatchUrl } from "../../../getMatchUrl";
import { DateTime } from "luxon";
import { SEASON_PASS_ONLY_SYSTEM_ID } from "../../../constants";
import { usePagination } from "../../amalgema-ui/hooks/usePagination";
import { Checkbox } from "../Theme/SkyStrife/Checkbox";

const CopyButton = ({ matchEntity }: { matchEntity: Entity }) => {
  const {
    network: {
      components: { LevelTemplates, MatchConfig, MatchMapCopyProgress },
      worldContract,
    },
  } = useAmalgema();

  const progress = useComponentValue(MatchMapCopyProgress, matchEntity);
  const { levelId } = getComponentValueStrict(MatchConfig, matchEntity);
  const templateIds = getComponentValue(LevelTemplates, levelId as Entity);

  const fraction = progress && templateIds ? Math.round(Number(progress.value * 100n) / templateIds.value.length) : 0;

  return (
    <Button
      buttonType="primary"
      onClick={() => {
        worldContract.write.copyMap([matchEntity as Hex]);
      }}
    >
      Copy ({fraction}%)
    </Button>
  );
};

const Row = ({ matchEntity }: { matchEntity: Entity }) => {
  const {
    components: { MatchConfig, MatchFinished, MatchReady, MatchAccessControl, MatchName },
    utils: { getLevelSpawns },
    externalWorldContract,
    externalWalletClient,
  } = useAmalgema();

  const matchConfig = getComponentValue(MatchConfig, matchEntity);

  const spawns = matchConfig ? getLevelSpawns(matchConfig.levelId) : [];

  const readyTime = useComponentValue(MatchReady, matchEntity);
  const finished = getComponentValue(MatchFinished, matchEntity);
  const levelName = matchConfig?.levelId ? hexToString(matchConfig.levelId as Hex, { size: 32 }) : "N/A";
  const matchName = getComponentValue(MatchName, matchEntity)?.value ?? "";

  const registrationTime = DateTime.fromSeconds(Number(matchConfig?.registrationTime ?? 0n));
  const matchAccessControl = getComponentValue(MatchAccessControl, matchEntity);
  const isSeasonPassOnly = matchAccessControl && matchAccessControl.systemId === SEASON_PASS_ONLY_SYSTEM_ID;

  return (
    <tr className="border border-black border-b-2" key={matchEntity}>
      <td>
        (<MatchNumber matchEntity={matchEntity} />) <span className="text-bold text-black">{matchName}</span>
      </td>
      <td>{levelName}</td>
      <td>{spawns.length} players max</td>
      <td>{finished ? "Yes" : "No"}</td>
      <td>{isSeasonPassOnly ? "Yes" : "No"}</td>
      <td>
        <div>
          GMT Time: {registrationTime.setZone("GMT").toFormat("yyyy-MM-dd HH:mm:ss")}
          <br />
          Local Time: {registrationTime.toFormat("yyyy-MM-dd HH:mm:ss")}
        </div>
      </td>
      <td>
        {readyTime ? (
          <a href={getMatchUrl(matchEntity)}>
            <Button buttonType="primary">Join</Button>
          </a>
        ) : (
          <CopyButton matchEntity={matchEntity} />
        )}
      </td>
      <td>
        <Button
          buttonType="secondary"
          onClick={() => {
            if (!externalWorldContract) return;
            if (!externalWalletClient?.account) return;

            externalWorldContract.write.adminDestroyMatch([matchEntity as Hex], {
              account: externalWalletClient.account,
            });
          }}
        >
          destroy match
        </Button>
      </td>
    </tr>
  );
};

const MatchTable = ({ matches }: { matches: Entity[] }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="flex flex-row">
        <div className="w-full text-3xl text-left p-1">Matches</div>
        <Button buttonType="primary" onClick={() => setVisible(true)}>
          Create match
        </Button>
      </div>

      <table className="w-full text-lg text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xl text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th>Lobby</th>
            <th>Map</th>
            <th>Players</th>
            <th>Finished?</th>
            <th>Season Pass Only?</th>
            <th>Registration Time</th>
            <th />
            <th />
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <Row key={match} matchEntity={match} />
          ))}
        </tbody>
      </table>
      {visible && <CreateMatch close={() => setVisible(false)} />}
    </div>
  );
};

export const Matches = () => {
  const {
    components: { MatchConfig, MatchIndex, MatchFinished },
  } = useAmalgema();

  const [showFinished, setShowFinished] = useState(false);
  const [hideFutureScheduled, setHideFutureScheduled] = useState(false);

  const matches = useEntityQuery([Has(MatchConfig), showFinished ? Has(MatchFinished) : Not(MatchFinished)]).filter(
    (m) => {
      if (!hideFutureScheduled) return true;

      const matchConfig = getComponentValue(MatchConfig, m);
      return Number(matchConfig?.registrationTime ?? 0) < DateTime.now().toUTC().toSeconds();
    }
  );
  matches.sort((a, b) => {
    const aIndex = getComponentValue(MatchIndex, a)?.matchIndex || 0;
    const bIndex = getComponentValue(MatchIndex, b)?.matchIndex || 0;

    return Number(bIndex) - Number(aIndex);
  });

  const pageSize = 10;
  const { form: paginationForm, page } = usePagination({
    totalItems: matches.length,
    pageSize,
  });

  const visibleMatches = matches.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="flex">
        {paginationForm}

        <div className="w-8" />

        <Checkbox
          checkedLabel="Show finished matches"
          uncheckedLabel="Hide finished matches"
          isChecked={showFinished}
          setIsChecked={setShowFinished}
        />

        <Checkbox
          checkedLabel="Hide matches scheduled in the future"
          uncheckedLabel="Show"
          isChecked={hideFutureScheduled}
          setIsChecked={setHideFutureScheduled}
        />
      </div>

      <MatchTable matches={visibleMatches} />
    </div>
  );
};
