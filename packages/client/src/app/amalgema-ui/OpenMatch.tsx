import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { Button } from "../ui/Theme/SkyStrife/Button";
import { Card } from "../ui/Theme/SkyStrife/Card";
import { Body, Heading, Link, OverlineLarge, OverlineSmall } from "../ui/Theme/SkyStrife/Typography";
import { useAmalgema } from "../../useAmalgema";
import { Entity, Has, HasValue, getComponentValue, runQuery } from "@latticexyz/recs";
import { MatchRewardsFooter, ordinalSuffix } from "./MatchRewardsFooter";
import { Hex, formatEther, hexToString, stringToHex } from "viem";
import { CreatedBy, DisplayNameWithLink } from "./CreatedBy";
import { MatchPlayers } from "./MatchPlayers";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { ListIcon } from "../ui/Theme/ListIcon";
import { useCallback, useState } from "react";
import { useRef } from "react";
import useOnClickOutside from "../ui/hooks/useOnClickOutside";
import { addressToEntityID } from "../../mud/setupNetwork";
import { MatchNumber } from "../ui/MatchNumber";
import { getMatchUrl } from "../../getMatchUrl";
import { encodeSystemCalls } from "@latticexyz/world";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useOrbBalance } from "./hooks/useOrbBalance";
import { useSeasonPassExternalWallet } from "./hooks/useSeasonPass";
import {
  ALLOW_LIST_SYSTEM_ID,
  LOBBY_SYSTEM_ID,
  PLAYER_REGISTER_SYSTEM_ID,
  SEASON_PASS_ONLY_SYSTEM_ID,
} from "../../constants";
import { Modal } from "./Modal";
import { PromiseButton } from "../ui/hooks/PromiseButton";
import { OrbInput, ReadOnlyTextInput } from "./SummonIsland/common";
import { useMatchRewards } from "./hooks/useMatchRewards";
import { LevelDisplay } from "./SummonIsland/LevelDisplay";
import { useAccessList } from "./hooks/useAccessList";
import { SessionWalletManager } from "./SessionWalletManager";
import { getDelegationSystemCalls } from "../../getDelegationSystemCalls";
import { useMatchInfo } from "../ui/hooks/useMatchInfo";
import { HeroSelect } from "./HeroSelect";
import { SeasonPassIcon } from "./SeasonPassIcon";

function AllowList({ matchEntity }: { matchEntity: Entity }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const allowedAccounts = useAccessList(matchEntity);

  useOnClickOutside(ref, () => setVisible(false));

  return (
    <div>
      <Button buttonType="tertiary" onClick={() => setVisible(true)}>
        <ListIcon />
      </Button>
      {visible && (
        <div
          style={{
            background: "rgba(24, 23, 16, 0.65)",
            zIndex: 100,
          }}
          className="fixed top-0 left-0 w-screen h-screen flex flex-col justify-around"
        >
          <div ref={ref} className="mx-auto">
            <Card primary className="bg-ss-bg-1 flex flex-col justify-center p-8 w-[624px]">
              <div className="flex justify-between items-center">
                <OverlineLarge>Access List</OverlineLarge>

                <Button buttonType={"tertiary"} onClick={() => setVisible(false)} className="h-fit py-1">
                  Close
                </Button>
              </div>

              <div className="h-6" />

              <Body>This is a private match. Only wallet addresses on the access list can join.</Body>

              <div className="h-6" />

              {allowedAccounts.length > 0
                ? allowedAccounts.map(({ account }) => (
                    <div key={account}>
                      <DisplayNameWithLink entity={addressToEntityID(account)} />
                    </div>
                  ))
                : "This access list is empty."}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export function OpenMatch({ matchEntity }: { matchEntity: Entity }) {
  const {
    components: { Match, MatchAccessControl, MatchAllowed, Player, OwnedBy, MatchSweepstake },
    network: { walletClient, publicClient },
    utils: { getAvailableLevelSpawns, hasSystemDelegation },
    externalWalletClient,
    externalWorldContract,
    executeSystemWithExternalWallet,
  } = useAmalgema();

  const [hero, setHero] = useState(stringToHex("Golem", { size: 32 }));

  const { openConnectModal } = useConnectModal();
  const hasSeasonPass = useSeasonPassExternalWallet();

  const matchInfo = useMatchInfo(matchEntity);
  const matchConfig = matchInfo?.matchConfig;

  const matchAccessControl = useComponentValue(MatchAccessControl, matchEntity);

  const matchSweepstake = useComponentValue(MatchSweepstake, matchEntity);
  const orbBalance = useOrbBalance();

  const canAffordEntrance = !matchSweepstake || orbBalance >= matchSweepstake.entranceFee;

  const hasAllowList = matchAccessControl && matchAccessControl.systemId === ALLOW_LIST_SYSTEM_ID;
  const isSeasonPassOnly = matchAccessControl && matchAccessControl.systemId === SEASON_PASS_ONLY_SYSTEM_ID;

  let isAllowed = true;

  if (hasAllowList) {
    isAllowed = [...runQuery([Has(MatchAllowed)])]
      .map((entity) => decodeEntity(MatchAllowed.metadata.keySchema, entity))
      .some(
        ({ matchEntity: entity, account }) =>
          externalWalletClient &&
          externalWalletClient.account &&
          entity === matchEntity &&
          account === externalWalletClient.account.address
      );
  }

  if (isSeasonPassOnly) {
    isAllowed = hasSeasonPass;
  }

  const allPlayersInMatch = useEntityQuery([Has(Player), HasValue(Match, { matchEntity })]);

  const currentPlayerInMatch = Boolean(
    allPlayersInMatch.find((p) => {
      if (!externalWalletClient?.account?.address) return false;

      const ownedBy = getComponentValue(OwnedBy, p)?.value as Hex;
      return ownedBy === addressToEntityID(externalWalletClient.account.address);
    })
  );

  const joinMatch = useCallback(async () => {
    if (!externalWalletClient) {
      if (openConnectModal) openConnectModal();
      return;
    }

    if (!matchConfig) return;
    if (!externalWorldContract) return;
    if (externalWalletClient.account?.address === undefined) return;

    // Try add chain for external wallets, in case they are on the wrong network
    if (externalWalletClient.account && externalWalletClient.transport.type === "custom") {
      await externalWalletClient.addChain({ chain: publicClient.chain });
      await externalWalletClient.switchChain({ id: publicClient.chain.id });
    }

    const spawns = getAvailableLevelSpawns(matchConfig.levelId, matchEntity as Hex);

    const spawn = spawns[Math.floor(Math.random() * spawns.length)];

    const hasDelegation = hasSystemDelegation(
      externalWalletClient.account.address,
      walletClient.account.address,
      LOBBY_SYSTEM_ID
    );

    if (hasDelegation) {
      await executeSystemWithExternalWallet({
        systemCall: "register",
        args: [[matchEntity as Hex, spawn, hero]],
      });
    } else {
      await executeSystemWithExternalWallet({
        systemCall: "batchCall",
        systemId: "JoinMatch",
        args: [
          [
            encodeSystemCalls(IWorldAbi, [
              {
                systemId: PLAYER_REGISTER_SYSTEM_ID,
                functionName: "register",
                args: [matchEntity as Hex, spawn, hero],
              },
              ...getDelegationSystemCalls(walletClient.account.address),
            ]).map(([systemId, callData]) => ({ systemId, callData })),
          ],
        ],
      });
    }

    window.location.assign(getMatchUrl(matchEntity));
  }, [
    executeSystemWithExternalWallet,
    externalWalletClient,
    externalWorldContract,
    getAvailableLevelSpawns,
    hasSystemDelegation,
    hero,
    matchConfig,
    matchEntity,
    openConnectModal,
    publicClient.chain,
    walletClient.account.address,
  ]);

  let joinButtonMessage = "Join";
  if (!canAffordEntrance) joinButtonMessage = "Not enough 🔮";
  if (!isAllowed) {
    if (isSeasonPassOnly) joinButtonMessage = "Season pass only";
    else if (hasAllowList) joinButtonMessage = "Not on access list";
  }

  const { totalRewards, sweepstakeRewards } = useMatchRewards(matchEntity);
  const allowedAccounts = useAccessList(matchEntity);
  const [previewLevel, setPreviewLevel] = useState(false);
  const [showAccessList, setShowAccessList] = useState(false);

  let matchTypeString = "Public";
  if (hasAllowList) matchTypeString = "Private";
  else if (isSeasonPassOnly) matchTypeString = "Season Pass Only";

  let matchTypeIcon = <>📜</>;
  if (hasAllowList) matchTypeIcon = <>🔒</>;
  else if (isSeasonPassOnly) matchTypeIcon = <SeasonPassIcon />;

  if (!matchConfig) return <></>;

  return (
    <>
      <Card primary>
        <div className="flex flex-row justify-between items-center">
          <span className="flex flex-row items-center">
            <div className="text-lg">{matchTypeIcon}</div>
            <div className="w-2" />
            <Heading className="normal-case">{matchInfo.matchName}</Heading>
          </span>
          <Body className="text-ss-text-x-light">
            <MatchNumber matchEntity={matchEntity} />
          </Body>
        </div>

        {matchConfig && <CreatedBy createdBy={matchConfig.createdBy as Hex} />}

        <div className="h-3"></div>

        <MatchPlayers matchEntity={matchEntity} />

        <div className="h-6"></div>

        <div className="flex flex-row">
          {currentPlayerInMatch ? (
            <a href={getMatchUrl(matchEntity)} target="_blank" rel="noreferrer" className="pointer w-full">
              <Button buttonType={"secondary"} className="w-full">
                open match
              </Button>
            </a>
          ) : (
            <Modal
              title={`join match - ${matchInfo.matchName}`}
              trigger={
                <Button buttonType={"secondary"} className="w-full">
                  {joinButtonMessage}
                </Button>
              }
              footer={
                <>
                  <PromiseButton
                    disabled={!isAllowed || !canAffordEntrance}
                    buttonType={"secondary"}
                    className="w-full"
                    promise={() => joinMatch()}
                  >
                    {joinButtonMessage}{" "}
                    {matchSweepstake?.entranceFee ? `- pay ${formatEther(matchSweepstake.entranceFee)} 🔮` : null}
                  </PromiseButton>
                </>
              }
            >
              <div className="flex flex-col justify-around">
                <div>
                  <SessionWalletManager />

                  <div className="h-4" />

                  <div className="flex justify-around">
                    <div className="grow">
                      <OverlineSmall className="text-ss-text-x-light font-light">Your Resources</OverlineSmall>
                      <OrbInput amount={BigInt(formatEther(orbBalance ?? "0"))} />
                    </div>
                    <div className="w-4" />

                    <div className="grow">
                      <OverlineSmall className="text-ss-text-x-light font-light">Entrance Fee</OverlineSmall>
                      <OrbInput amount={BigInt(formatEther(matchSweepstake?.entranceFee ?? 0n))} />
                    </div>
                  </div>

                  <div className="h-4" />

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
                      if (reward.value === 0n) return <></>;

                      return (
                        <div key={i} className="flex-grow">
                          <OverlineSmall className="text-ss-text-x-light font-light">
                            {ordinalSuffix(i + 1)}
                          </OverlineSmall>
                          <OrbInput amount={BigInt(formatEther(reward.value))} />
                        </div>
                      );
                    })}

                    {sweepstakeRewards[totalRewards.length]?.value > 0n && (
                      <div className="flex-grow">
                        <OverlineSmall className="text-ss-text-x-light font-light">Creator</OverlineSmall>
                        <OrbInput amount={BigInt(formatEther(sweepstakeRewards[totalRewards.length].value))} />
                      </div>
                    )}
                  </div>

                  <div className="h-4" />

                  <HeroSelect hero={hero} setHero={setHero} />
                </div>
              </div>
            </Modal>
          )}

          {hasAllowList && (
            <>
              <div className="w-3" />
              <AllowList matchEntity={matchEntity} />
            </>
          )}
        </div>

        <div className="mb-3"></div>

        <a href={getMatchUrl(matchEntity)} target="_blank" rel="noopener noreferrer">
          <Button buttonType={"tertiary"} className="w-full">
            Spectate
          </Button>
        </a>

        <div className="mb-4" />

        <MatchRewardsFooter matchEntity={matchEntity} />
      </Card>
    </>
  );
}
