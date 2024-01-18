import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue, getComponentValue } from "@latticexyz/recs";
import { useState } from "react";
import { useAmalgema } from "../../../useAmalgema";
import { Hex, formatEther, hexToString, stringToHex } from "viem";
import { useMatchRewards } from "../hooks/useMatchRewards";
import { Modal } from "../Modal";
import { useMatchInfo } from "../../ui/hooks/useMatchInfo";
import { PromiseButton } from "../../ui/hooks/PromiseButton";
import { HeroSelect } from "../HeroSelect";
import { SessionWalletManager } from "../SessionWalletManager";
import { Link, OverlineSmall } from "../../ui/Theme/SkyStrife/Typography";
import { OrbInput, ReadOnlyTextInput } from "../SummonIsland/common";
import { getMatchUrl } from "../../../getMatchUrl";
import { LevelDisplay } from "../SummonIsland/LevelDisplay";
import { useAccessList } from "../hooks/useAccessList";
import { addressToEntityID } from "../../../mud/setupNetwork";
import { DisplayNameWithLink } from "../CreatedBy";
import { ordinalSuffix } from "../MatchRewardsFooter";
import { Button } from "../../ui/Theme/SkyStrife/Button";
import { useCanAffordEntrance, useIsAllowed, useJoinMatch } from "./hooks";
import { useExternalAccount } from "../hooks/useExternalAccount";
import { useBurnerBalance } from "../hooks/useBurnerBalance";

/**
 * Don't ask me why, but managing the open state outside
 * of the modal is broken. I'm letting the Modal handle its own
 * state and passing the children as a trigger.
 */
export function JoinModal({ matchEntity, children }: { matchEntity: Entity; children: React.ReactNode }) {
  const {
    network: {
      components: { MatchSweepstake, Player, Match, OwnedBy },
    },
    components: { MatchJoinable },
  } = useAmalgema();

  const [hero, setHero] = useState(stringToHex("Golem", { size: 32 }));
  const [previewLevel, setPreviewLevel] = useState(false);
  const [showAccessList, setShowAccessList] = useState(false);

  const { totalRewards, sweepstakeRewards } = useMatchRewards(matchEntity);
  const allowedAccounts = useAccessList(matchEntity);

  const matchInfo = useMatchInfo(matchEntity);
  const matchConfig = matchInfo.matchConfig;
  const matchSweepstake = getComponentValue(MatchSweepstake, matchEntity);
  const matchJoinable = useComponentValue(MatchJoinable, matchEntity)?.value;

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

  const joinMatch = useJoinMatch(matchEntity, hero);

  const { address } = useExternalAccount();
  const allPlayersInMatch = useEntityQuery([Has(Player), HasValue(Match, { matchEntity })]);

  const currentPlayerInMatch = Boolean(
    allPlayersInMatch.find((p) => {
      if (!address) return false;

      const ownedBy = getComponentValue(OwnedBy, p)?.value as Hex;
      return ownedBy === addressToEntityID(address);
    })
  );

  const burnerBalance = useBurnerBalance();

  return (
    <Modal
      trigger={children}
      title={`${matchInfo.matchName}`}
      footer={
        <div className="w-full flex gap-x-4">
          {!currentPlayerInMatch && (
            <a href={getMatchUrl(matchEntity)} target="_blank" rel="noopener noreferrer" className="grow">
              <Button buttonType={"tertiary"} className="w-full">
                Spectate
              </Button>
            </a>
          )}

          {currentPlayerInMatch && (
            <a href={getMatchUrl(matchEntity)} target="_blank" rel="noopener noreferrer" className="grow">
              <Button buttonType={"tertiary"} className="w-full">
                Play
              </Button>
            </a>
          )}

          {!currentPlayerInMatch && matchJoinable && (
            <PromiseButton
              disabled={!isAllowed || !canAffordEntrance}
              buttonType={"secondary"}
              className="grow"
              promise={() => joinMatch()}
            >
              {joinButtonMessage}{" "}
              {matchSweepstake?.entranceFee ? `- pay ${formatEther(matchSweepstake.entranceFee)} 🔮` : null}
            </PromiseButton>
          )}
        </div>
      }
    >
      <div className="flex flex-col justify-around">
        {burnerBalance.belowMinimum && (
          <>
            <SessionWalletManager /> <div className="h-4" />
          </>
        )}

        {matchJoinable && (
          <>
            <HeroSelect hero={hero} setHero={setHero} />
            <div className="h-4" />
          </>
        )}

        <div className="flex justify-around">
          <div className="grow">
            <OverlineSmall className="text-ss-text-x-light font-light">Map</OverlineSmall>
            <ReadOnlyTextInput
              value={hexToString((matchConfig?.levelId ?? "0x") as Hex, { size: 32 })}
              symbol={
                <div onClick={() => setPreviewLevel(!previewLevel)}>
                  <Link>Map Preview</Link>
                </div>
              }
            />
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
            <LevelDisplay levelId={matchConfig?.levelId ?? "0x"} />
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
      </div>
    </Modal>
  );
}
