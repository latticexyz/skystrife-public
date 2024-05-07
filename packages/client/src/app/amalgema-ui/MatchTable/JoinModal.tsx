import { useComponentValue } from "@latticexyz/react";
import { Entity, HasValue, getComponentValue, runQuery } from "@latticexyz/recs";
import { useEffect, useMemo, useState } from "react";
import { useAmalgema } from "../../../useAmalgema";
import { Hex, formatEther, hexToString } from "viem";
import { Modal } from "../Modal";
import { useMatchInfo } from "../../ui/hooks/useMatchInfo";
import { PromiseButton } from "../../ui/hooks/PromiseButton";
import { HeroSelect } from "../HeroSelect";
import { SessionWalletManager } from "../SessionWalletManager";
import { Link, OverlineSmall } from "../../ui/Theme/SkyStrife/Typography";
import { OrbInput, ReadOnlyTextInput } from "../SummonIsland/common";
import { getMatchUrl } from "../../../getMatchUrl";
import { MapDisplay } from "../SummonIsland/MapDisplay";
import { useAccessList } from "../hooks/useAccessList";
import { addressToEntityID } from "../../../mud/setupNetwork";
import { DisplayNameWithLink } from "../CreatedBy";
import { ordinalSuffix } from "../MatchRewardsFooter";
import { Button } from "../../ui/Theme/SkyStrife/Button";
import { useCanAffordEntrance, useIsAllowed, useJoinMatch } from "./hooks";
import { useExternalAccount } from "../hooks/useExternalAccount";
import { useBurnerBalance } from "../hooks/useBalance";
import { twMerge } from "tailwind-merge";
import { ConfirmedCheck } from "../../ui/Theme/SkyStrife/Icons/ConfirmedCheck";
import { encodeMatchEntity } from "../../../encodeMatchEntity";

/**
 * Don't ask me why, but managing the open state outside
 * of the modal is broken. I'm letting the Modal handle its own
 * state and passing the children as a trigger.
 */
export function JoinModal({
  matchEntity,
  children,
  viewOnly,
  isOpen,
  setIsOpen,
}: {
  matchEntity: Entity;
  children?: React.ReactNode;
  viewOnly?: boolean;
  isOpen?: boolean;
  setIsOpen?: (o: boolean) => void;
}) {
  const {
    network: {
      components: { MatchSweepstake, MatchPlayers, CreatedByAddress, OfficialLevel, HeroInRotation },
    },
    components: { MatchJoinable },
    utils: { getMatchRewards },
  } = useAmalgema();

  const [hero, setHero] = useState<Hex | null>(null);
  const [previewLevel, setPreviewLevel] = useState(false);
  const [showAccessList, setShowAccessList] = useState(false);

  useEffect(() => {
    const freeHero = [...runQuery([HasValue(HeroInRotation, { value: true })])][0];
    setHero(freeHero as Hex);
  }, [isOpen, HeroInRotation]);

  const { totalRewards, sweepstakeRewards } = getMatchRewards(matchEntity);
  const allowedAccounts = useAccessList(matchEntity);

  const matchInfo = useMatchInfo(matchEntity);
  const matchConfig = matchInfo.matchConfig;
  const matchSweepstake = getComponentValue(MatchSweepstake, matchEntity);
  const matchJoinable = useComponentValue(MatchJoinable, matchEntity)?.value;

  const levelId = (matchConfig?.levelId ?? "0x") as Hex;
  const levelName = hexToString(levelId, { size: 32 });
  const levelOfficial = getComponentValue(OfficialLevel, levelId as Entity)?.value;

  const { isAllowed, hasAllowList, isSeasonPassOnly } = useIsAllowed(matchEntity);
  const { canAffordEntrance } = useCanAffordEntrance(matchEntity);

  let joinButtonMessage = "Join";
  if (!canAffordEntrance) joinButtonMessage = "Not enough 🔮";
  if (!isAllowed) {
    if (isSeasonPassOnly) joinButtonMessage = "Season pass only";
    else if (hasAllowList) joinButtonMessage = "Not on access list";
  }

  let matchTypeString = "Public";
  if (hasAllowList) matchTypeString = "Private";
  else if (isSeasonPassOnly) matchTypeString = "Season Pass Only";

  const joinMatch = useJoinMatch(matchEntity, hero as Hex);

  const { address } = useExternalAccount();
  const allPlayersInMatch = useComponentValue(MatchPlayers, matchEntity)?.value ?? [];

  const currentPlayerInMatch = useMemo(
    () =>
      Boolean(
        allPlayersInMatch.find((p) => {
          if (!address) return false;

          const createdBy = getComponentValue(CreatedByAddress, encodeMatchEntity(matchEntity, p))?.value as Hex;
          return createdBy === addressToEntityID(address);
        }),
      ),
    [],
  );

  const burnerBalance = useBurnerBalance();

  let openParams = {};
  if (setIsOpen)
    openParams = {
      isOpen,
      setOpen: setIsOpen,
    };

  return (
    <Modal
      {...openParams}
      trigger={children}
      title={`${matchInfo.matchName}`}
      footer={
        viewOnly ? null : (
          <div className="w-full flex gap-x-4">
            {!currentPlayerInMatch && (
              <a href={getMatchUrl(matchEntity)} target="_blank" rel="noopener noreferrer" className="grow">
                <Button buttonType="tertiary" className="w-full">
                  Spectate
                </Button>
              </a>
            )}

            {currentPlayerInMatch && (
              <a href={getMatchUrl(matchEntity)} target="_blank" rel="noopener noreferrer" className="grow">
                <Button buttonType="tertiary" className="w-full">
                  Re-Join
                </Button>
              </a>
            )}

            {!currentPlayerInMatch && matchJoinable && (
              <PromiseButton
                disabled={!isAllowed || !canAffordEntrance}
                buttonType="secondary"
                className="grow"
                promise={() => joinMatch()}
              >
                {joinButtonMessage}{" "}
                {matchSweepstake?.entranceFee ? `- pay ${formatEther(matchSweepstake.entranceFee)} 🔮` : null}
              </PromiseButton>
            )}
          </div>
        )
      }
    >
      <div className="flex flex-col justify-around">
        {!viewOnly && burnerBalance.danger && (
          <>
            <SessionWalletManager /> <div className="h-4" />
          </>
        )}

        {!viewOnly && matchJoinable && hero && (
          <>
            <HeroSelect hero={hero} setHero={setHero} />
            <div className="h-4" />
          </>
        )}

        <div className="flex justify-around">
          <div className="grow">
            <OverlineSmall className="text-ss-text-x-light font-light">Map</OverlineSmall>
            <div className="relative w-full">
              <span
                style={{
                  fontSize: "14px",
                }}
                className="absolute left-[6px] top-[13px] text-ss-text-x-light uppercase"
              >
                {levelOfficial && <ConfirmedCheck />}
              </span>

              <input
                className={twMerge("w-full bg-ss-bg-2 px-6 py-2 border border-[#DDDAD0]")}
                type="text"
                readOnly
                value={levelName}
              />

              <span className="absolute right-3 top-[8px]">
                <div onClick={() => setPreviewLevel(!previewLevel)}>
                  <Link>Map Preview</Link>
                </div>
              </span>
            </div>
          </div>

          <div className="w-4" />

          <div className="grow">
            <OverlineSmall className="text-ss-text-x-light font-light">match type</OverlineSmall>
            <ReadOnlyTextInput
              value={matchTypeString}
              symbol={
                <>
                  {hasAllowList && (
                    <div onClick={() => setShowAccessList(!showAccessList)}>
                      <Link>Access List</Link>
                    </div>
                  )}
                </>
              }
            />
          </div>
        </div>

        {previewLevel && (
          <>
            <div className="h-4" />
            <MapDisplay levelId={matchConfig?.levelId ?? "0x"} />
          </>
        )}

        {showAccessList && (
          <>
            {allowedAccounts.length > 0 && (
              <>
                <div className="h-4" />

                <OverlineSmall className="text-ss-text-x-light font-light">Access List</OverlineSmall>
                <div className="flex space-x-2">
                  {allowedAccounts.map(({ account }) => (
                    <div key={account} className="bg-ss-bg-2 p-2">
                      <DisplayNameWithLink entity={addressToEntityID(account)} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <div className="h-4" />

        <div className="flex space-x-4">
          {totalRewards.map((reward, i) => {
            if (reward.value === 0n) return null;

            return (
              <div key={i} className="flex-grow">
                <OverlineSmall className="text-ss-text-x-light font-light">{ordinalSuffix(i + 1)}</OverlineSmall>
                <OrbInput amount={reward.value} />
              </div>
            );
          })}

          {sweepstakeRewards[totalRewards.length]?.value > 0n && (
            <div className="flex-grow">
              <OverlineSmall className="text-ss-text-x-light font-light">Creator</OverlineSmall>
              <OrbInput amount={sweepstakeRewards[totalRewards.length].value} />
            </div>
          )}
        </div>

        {viewOnly && matchSweepstake?.entranceFee ? (
          <>
            <div className="h-4" />

            <div className="flex justify-around">
              <div className="grow">
                <OverlineSmall className="text-ss-text-x-light font-light">Entrance Fee</OverlineSmall>
                <ReadOnlyTextInput value={`${formatEther(matchSweepstake.entranceFee)} 🔮`} />
              </div>
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </Modal>
  );
}
