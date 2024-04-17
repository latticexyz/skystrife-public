import React, { useEffect } from "react";
import Color from "color";
import { useCurrentPlayer } from "../hooks/useCurrentPlayer";
import { useMatchInfo } from "../hooks/useMatchInfo";
import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue, getComponentValue, runQuery } from "@latticexyz/recs";
import { useMUD } from "../../../useMUD";
import { Checkbox } from "../Theme/Checkbox";
import { Button, ButtonType } from "../Theme/Button";
import { Caption, OverlineSmall } from "../Theme/SkyStrife/Typography";
import { DisplayNameUnformatted } from "../../amalgema-ui/CreatedBy";
import { decodeMatchEntity } from "../../../decodeMatchEntity";
import { UnitTypeSprites } from "../../../layers/Renderer/Phaser/phaserConstants";
import { SpriteImage } from "../Theme/SpriteImage";

function StarSVG() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9.47991 1.49921C9.5222 1.39605 9.59423 1.30779 9.68683 1.24567C9.77942 1.18356 9.8884 1.15039 9.99991 1.15039C10.1114 1.15039 10.2204 1.18356 10.313 1.24567C10.4056 1.30779 10.4776 1.39605 10.5199 1.49921L12.6449 6.61021C12.6847 6.70585 12.7501 6.78866 12.8339 6.84953C12.9177 6.9104 13.0167 6.94697 13.1199 6.95521L18.6379 7.39721C19.1369 7.43721 19.3389 8.06021 18.9589 8.38521L14.7549 11.9872C14.6764 12.0544 14.6178 12.1419 14.5857 12.2402C14.5536 12.3384 14.5492 12.4436 14.5729 12.5442L15.8579 17.9292C15.8837 18.0373 15.877 18.1505 15.8385 18.2547C15.7999 18.3589 15.7314 18.4494 15.6415 18.5146C15.5517 18.5799 15.4444 18.6171 15.3335 18.6214C15.2225 18.6258 15.1126 18.5972 15.0179 18.5392L10.2929 15.6542C10.2046 15.6004 10.1033 15.572 9.99991 15.572C9.89654 15.572 9.79517 15.6004 9.70691 15.6542L4.98191 18.5402C4.88716 18.5982 4.77736 18.6268 4.66636 18.6224C4.55537 18.6181 4.44816 18.5809 4.35827 18.5156C4.26839 18.4504 4.19987 18.3599 4.16136 18.2557C4.12285 18.1515 4.11608 18.0383 4.14191 17.9302L5.42691 12.5442C5.45074 12.4436 5.44636 12.3384 5.41425 12.2401C5.38214 12.1418 5.32354 12.0543 5.24491 11.9872L1.04091 8.38521C0.95672 8.31283 0.895817 8.21716 0.865856 8.11025C0.835895 8.00334 0.838215 7.88996 0.872523 7.78436C0.906831 7.67876 0.971595 7.58567 1.05867 7.51678C1.14575 7.4479 1.25125 7.4063 1.36191 7.39721L6.87991 6.95521C6.98316 6.94697 7.08213 6.9104 7.16593 6.84953C7.24974 6.78866 7.31513 6.70585 7.35491 6.61021L9.47991 1.49921Z"
        fill="#25241D"
        stroke="#25241D"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const MatchLobby = ({ matchEntity }: { matchEntity: Entity }) => {
  const {
    networkLayer: {
      components: { Player, PlayerReady, Match, MatchConfig, CreatedByAddress, OwnedBy, UnitType },
      utils: { getLevelSpawns },
    },
    headlessLayer: {
      api: { getOwnerColor },
    },
  } = useMUD();

  const currentPlayer = useCurrentPlayer(matchEntity);
  const matchInfo = useMatchInfo(matchEntity);

  const [countdown, setCountdown] = React.useState(5);
  const [timeUntilSpawn, setTimeUntilSpawn] = React.useState(0);
  const [spawning, setSpawning] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();
  const [tick, setTick] = React.useState(0);

  useEffect(() => {
    const spawnTime = matchInfo.matchConfig?.startTime ?? BigInt(0);
    if (spawnTime === BigInt(0)) return;

    const now = BigInt(Math.floor(Date.now() / 1000));
    const timeUntilSpawn = Number(spawnTime - now);

    setTimeUntilSpawn(timeUntilSpawn);

    if (timeUntilSpawn <= 0 || timeUntilSpawn > 10) {
      return;
    }

    setSpawning(true);
    setCountdown(timeUntilSpawn);
  }, [matchInfo, tick]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const playerReadys = useEntityQuery([Has(PlayerReady), HasValue(Match, { matchEntity })]);
  const currentPlayerReady = Boolean(playerReadys.find((i) => i === currentPlayer?.player));

  const allPlayers = useEntityQuery([Has(Player), HasValue(Match, { matchEntity })]).sort((a, b) => {
    if (a === currentPlayer?.player) return -10000;
    if (b === currentPlayer?.player) return 10000;

    const aReady = Boolean(playerReadys.find((i) => i === a));
    const bReady = Boolean(playerReadys.find((i) => i === b));

    if (aReady && !bReady) return -1;
    if (!aReady && bReady) return 1;

    return 0;
  });

  const matchConfig = getComponentValue(MatchConfig, matchEntity);
  if (!matchConfig) return <></>;

  const allSpawns = getLevelSpawns(matchConfig.levelId);
  const gameFull = allPlayers.length >= allSpawns.length;

  return (
    <div className="flex-col items-center justify-center w-full">
      {!spawning ? (
        <div className="h-fit py-4">
          <div className="flex flex-col items-center">
            <div className="flex flex-row justify-between w-full text-lg text-black/60 uppercase">
              <OverlineSmall>lobby</OverlineSmall>

              <OverlineSmall>
                {playerReadys.length}/{allSpawns.length} players ready
              </OverlineSmall>
            </div>

            <div className="h-3" />

            <div className="w-full space-y-2">
              {allSpawns.map((_, i) => {
                const player = allPlayers[i];
                const playerReady = Boolean(playerReadys.find((i) => player === i));
                const playerColor = getOwnerColor(player, matchEntity);
                const isSelf = player === currentPlayer?.player;
                const owner = getComponentValue(CreatedByAddress, player);

                // this should only be the hero before the game starts
                const ownedUnits = runQuery([
                  Has(UnitType),
                  HasValue(OwnedBy, { value: decodeMatchEntity(player).entity }),
                ]);
                const hero = [...ownedUnits][0];
                const heroUnitType = getComponentValue(UnitType, hero)?.value;
                const heroSprite = UnitTypeSprites[heroUnitType ?? 0];

                return (
                  <div
                    className="flex flex-row items-center rounded p-2 px-3 w-full border border-1 border-white"
                    style={{
                      backgroundColor: player ? Color(playerColor.color).toString() : "#F4F3F1",
                    }}
                    key={`player-${i}`}
                  >
                    {player && (
                      <>
                        <Checkbox checked={playerReady} style={!player ? { backgroundColor: "grey" } : {}} />
                        <div className="w-full ml-2 overflow-hidden text-ellipsis text-xl text-black/80 flex row justify-between items-center">
                          {owner && <DisplayNameUnformatted entity={owner.value as Entity} />}
                          <div className="flex items-center space-x-2">
                            <SpriteImage spriteKey={heroSprite} colorName={playerColor.name} scale={1} />
                            {isSelf && <StarSVG />}
                          </div>
                        </div>
                      </>
                    )}
                    {!player && <div className="ml-2 text-xl text-ss-text-x-light">Empty Slot</div>}
                  </div>
                );
              })}
            </div>

            {error && currentPlayerReady && (
              <div className="flex w-full flex-col items-center">
                <div className="mb-4 rounded bg-red-800 p-3 text-center text-2xl text-red-200 w-full">
                  Error: {error.toString()}
                </div>
                <Button
                  buttonType={ButtonType.Confirm}
                  className="mx-auto w-full p-3 text-2xl uppercase"
                  onClick={() => {
                    setError(undefined);
                    setSpawning(false);
                  }}
                >
                  Try Again
                </Button>
              </div>
            )}

            {!spawning && !error && (
              <div className="w-full">
                {gameFull && (
                  <div className="flex flex-col items-center">
                    <div className="h-3" />
                    <Caption>Game starts in {timeUntilSpawn} seconds if players are not ready.</Caption>
                  </div>
                )}
              </div>
            )}

            <div className="h-4" />
          </div>
        </div>
      ) : (
        <>
          {!error &&
            (countdown > 0 ? (
              <div className="text-center">
                <div className="h-8" />
                <span className="text-black/60 uppercase">Game starting in...</span>
                <div className="text-9xl text-black">{countdown}</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="h-8" />
                <div className="text-6xl text-black">Starting...</div>
              </div>
            ))}
          <div className="h-4" />
        </>
      )}
    </div>
  );
};
