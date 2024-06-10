import { useComponentValue } from "@latticexyz/react";
import { Entity, getComponentValue } from "@latticexyz/recs";
import { useMUD } from "../../useMUD";
import { Card } from "./Theme/SkyStrife/Card";
import { Body, OverlineSmall } from "./Theme/SkyStrife/Typography";
import Color from "color";
import { Button } from "./Theme/SkyStrife/Button";
import { ClickWrapper } from "./Theme/ClickWrapper";
import { useMemo, useState } from "react";
import { Mana } from "./Theme/SkyStrife/Mana";
import { DisplayNameUnformatted } from "../amalgema-ui/CreatedBy";
import { encodeMatchEntity } from "../../encodeMatchEntity";
import { uniq } from "lodash";
import { useCurrentPlayer } from "./hooks/useCurrentPlayer";

const suffix = (function () {
  const s = ["th", "st", "nd", "rd"];
  return function (n: number) {
    const d = (n | 0) % 100;
    return d > 3 && d < 21 ? "th" : s[d % 10] || "th";
  };
})();

const PlayerName = ({ entity }: { entity: Entity | null }) => {
  const {
    networkLayer: {
      components: { CreatedByAddress },
    },
    localLayer: {
      api: { getPlayerInfo },
    },
  } = useMUD();

  const playerInfo = entity && getPlayerInfo(entity);
  const owner = entity && getComponentValue(CreatedByAddress, entity);

  return (
    <div
      style={{
        backgroundColor: playerInfo ? Color(playerInfo.playerColor.color).lighten(0.5).hex() : "",
        border: `1px solid ${playerInfo ? Color(playerInfo.playerColor.color).hex() : ""}`,
      }}
      className="rounded-lg px-3 py-1 font-medium text-ss-default h-8 flex flex-col justify-center w-[240px]"
    >
      {owner ? <DisplayNameUnformatted entity={owner.value as Entity} /> : "TBD"}
    </div>
  );
};

export const GameOutcome = ({ matchEntity }: { matchEntity: Entity }) => {
  const {
    networkLayer: {
      components: { MatchRanking, MatchConfig, MatchFinished },
      utils: { getMatchRewards, getLevelSpawns },
    },
    localLayer: {
      api: { getPlayerInfo },
    },
  } = useMUD();

  const [hide, setHide] = useState(false);

  const matchRewards = getMatchRewards(matchEntity).totalRewards;

  const finished = useComponentValue(MatchFinished, matchEntity);
  const currentPlayer = useCurrentPlayer(matchEntity);

  const ranking = useComponentValue(MatchRanking, matchEntity);

  const homepageParams = new URLSearchParams(window.location.search);
  homepageParams.delete("match");

  const matchConfig = useComponentValue(MatchConfig, matchEntity);
  const totalLevelSpawns = useMemo(
    () => getLevelSpawns(matchConfig?.levelId || "").length,
    [getLevelSpawns, matchConfig?.levelId],
  );

  // TODO: fix this for real on the contract
  // there is a situation where the ranking has the same player added twice
  // it does not affect rewards so i am avoiding fixing this on the contracts for now
  const playerRankings = uniq(ranking?.value ?? []) as Entity[];
  const finalRankings = [] as (Entity | undefined)[];
  for (let i = totalLevelSpawns - 1; i >= 0; i--) {
    if (playerRankings[0]) {
      finalRankings[i] = playerRankings.pop();
    } else {
      finalRankings[i] = undefined;
    }
  }

  const winner = finalRankings.filter((x) => x).length === totalLevelSpawns ? finalRankings[0] : null;
  const winnerInfo = winner ? getPlayerInfo(encodeMatchEntity(matchEntity, winner)) : null;

  console.log(winner);

  if (!ranking) return <></>;

  return (
    <>
      {!hide && (currentPlayer?.playerEliminated || finished) && (
        <ClickWrapper className="fixed w-screen h-screen top-0 left-0 flex flex-col items-center justify-center bg-[#181710]/60">
          <div className="-mt-[240px]">
            <div className="relative h-[310px] overflow-hidden">
              <div className="absolute top-[215px] w-full text-center text-white text-5xl">
                {winner && winnerInfo ? `${winnerInfo.name} wins!` : "You were eliminated."}
              </div>
              <img className="" src="/assets/victory-banner.png" />
            </div>

            <Card
              style={{
                zIndex: 120,
              }}
              className="w-[640px] p-8"
            >
              <div className="flex justify-between gap-4">
                <div className="w-[56px]">
                  <OverlineSmall className="mb-3 text-ss-text-x-light">Rank</OverlineSmall>
                  <div className="space-y-2">
                    {finalRankings.map((_entity, i) => {
                      return (
                        <Body key={`rank-${i}`} className="h-8 text-ss-text-default">
                          {i + 1}
                          {suffix(i + 1)}
                        </Body>
                      );
                    })}
                  </div>
                </div>

                <div className="grow">
                  <OverlineSmall className="mb-3 text-ss-text-x-light">Player</OverlineSmall>
                  <div className="space-y-2">
                    {finalRankings.map((entity, i) => {
                      return (
                        <PlayerName key={`name-${i}`} entity={entity ? encodeMatchEntity(matchEntity, entity) : null} />
                      );
                    })}
                  </div>
                </div>

                <div className="w-[80px]">
                  <OverlineSmall className="mb-3 text-ss-text-x-light">Reward</OverlineSmall>
                  <div className="space-y-2">
                    {finalRankings.map((_entity, i) => {
                      return <Mana key={`reward-${i}`} className="h-8" amount={matchRewards[i]?.value ?? 0} />;
                    })}
                  </div>
                </div>
              </div>

              <div className="h-4" />

              {!finished && (
                <>
                  <Body className="w-full text-center">🔮 rewards are distributed when the match ends.</Body>
                </>
              )}

              <div className="h-4" />

              <div className="flex">
                <a className="grow" href={`/?${homepageParams.toString()}`}>
                  <Button className="w-full" buttonType="primary">
                    Back to Menu
                  </Button>
                </a>

                <div className="w-3" />

                <Button className="grow" onClick={() => setHide(true)} buttonType="tertiary">
                  {winner ? "View Match" : "Continue Playing"}
                </Button>
              </div>
            </Card>
          </div>
        </ClickWrapper>
      )}

      {hide && (currentPlayer?.playerEliminated || finished) && (
        <div className="fixed w-screen h-screen flex flex-col -ml-8 -mt-8">
          <div className="h-5/6" />

          <ClickWrapper className="mx-auto flex flex-row">
            <a href={`/?${homepageParams.toString()}`}>
              <Button buttonType="primary" className="text-3xl px-8 py-6">
                Back to Menu
              </Button>
            </a>

            <div className="w-16" />

            <Button buttonType="primary" className="text-3xl px-8 py-6" onClick={() => setHide(false)}>
              View Results
            </Button>
          </ClickWrapper>
        </div>
      )}
    </>
  );
};
