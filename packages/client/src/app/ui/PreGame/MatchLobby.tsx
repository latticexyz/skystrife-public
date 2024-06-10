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
import { Star } from "../Theme/SkyStrife/Icons/Star";

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
  const [playedSound, setPlayedSound] = React.useState(false);

  useEffect(() => {
    const spawnTime = matchInfo.matchConfig?.startTime ?? BigInt(0);
    if (spawnTime === BigInt(0)) return;

    const now = BigInt(Math.floor(Date.now() / 1000));
    const timeUntilSpawn = Number(spawnTime - now);

    setTimeUntilSpawn(timeUntilSpawn);

    if (timeUntilSpawn <= 0 || timeUntilSpawn > 10) {
      return;
    }

    if (!playedSound) {
      setPlayedSound(true);
      const audio = new Audio("/public/assets/bottle_bell_reverb.mp3");
      audio.play();
    }

    setSpawning(true);
    setCountdown(timeUntilSpawn);
  }, [matchInfo, tick, playedSound]);

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
                            {isSelf && <Star />}
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
