import { useEffect, useRef, useState } from "react";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { Entity, getComponentValue, Has, HasValue, runQuery } from "@latticexyz/recs";
import { useMUD } from "../../../useMUD";
import { useCurrentPlayer } from "../hooks/useCurrentPlayer";
import { Button } from "../Theme/SkyStrife/Button";
import { Heading, OverlineSmall } from "../Theme/SkyStrife/Typography";
import { addressToEntityID } from "../../../mud/setupNetwork";
import { ContractFunctionName, Hex, formatEther, stringToHex } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useMatchInfo } from "../hooks/useMatchInfo";
import { CreatedBy } from "../../amalgema-ui/CreatedBy";
import { SendTxButton } from "../hooks/SendTxButton";
import { getMatchUrl } from "../../../getMatchUrl";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { SystemCall, encodeSystemCallFrom, encodeSystemCalls } from "@latticexyz/world/internal";
import { BUILD_SYSTEM_ID, LOBBY_SYSTEM_ID, NAME_SYSTEM_ID, PLAYER_REGISTER_SYSTEM_ID } from "../../../constants";
import { SessionWalletManager } from "../../amalgema-ui/SessionWalletManager";
import { useExternalAccount } from "../hooks/useExternalAccount";
import { getDelegationSystemCalls } from "../../../getDelegationSystemCalls";
import { useBurnerBalance } from "../../amalgema-ui/hooks/useBalance";
import { useOrbBalance } from "../../amalgema-ui/hooks/useOrbBalance";
import { LabeledOrbInput } from "../../amalgema-ui/SummonIsland/common";
import { HeroSelect } from "../../amalgema-ui/HeroSelect";
import { useIsAllowed } from "../../amalgema-ui/MatchTable/hooks";
import { SeasonPassIcon } from "../../amalgema-ui/SeasonPassIcon";
import { JoinModal } from "../../amalgema-ui/MatchTable/JoinModal";
import { useNameIsValid } from "../../amalgema-ui/hooks/useNameIsValid";

function ChainSVG({ onClick }: { onClick?: () => void }) {
  const [hover, setHover] = useState(false);

  return (
    <svg
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseDown={() => setHover(false)}
      onClick={onClick}
      style={{
        transform: hover ? "scale(1.1)" : "",
        transition: "transform 0.1s ease-in-out",
      }}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1294_6801)">
        <path
          d="M8.79335 5.79202C9.22657 5.99886 9.60382 6.30664 9.89342 6.68951C10.183 7.07238 10.3765 7.51916 10.4576 7.99232C10.5388 8.46548 10.5052 8.9512 10.3596 9.40867C10.2141 9.86614 9.96093 10.282 9.62135 10.6214L6.62135 13.6213C6.05874 14.184 5.29567 14.5 4.50002 14.5C3.70436 14.5 2.9413 14.184 2.37869 13.6213C1.81607 13.0587 1.5 12.2957 1.5 11.5C1.5 10.7044 1.81607 9.9413 2.37869 9.37868L3.55002 8.20735M12.45 7.79268L13.6213 6.62135C14.184 6.05874 14.5 5.29567 14.5 4.50002C14.5 3.70436 14.184 2.9413 13.6213 2.37869C13.0587 1.81607 12.2957 1.5 11.5 1.5C10.7044 1.5 9.9413 1.81607 9.37868 2.37869L6.37868 5.37868C6.03911 5.71802 5.78593 6.13389 5.64041 6.59137C5.49488 7.04884 5.46127 7.53456 5.5424 8.00772C5.62352 8.48087 5.81701 8.92765 6.10661 9.31053C6.39621 9.6934 6.77347 10.0012 7.20669 10.208"
          stroke="#5D5D4C"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1294_6801">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

const RegistrationForm = ({ matchEntity, address }: { matchEntity: Entity; address: Hex }) => {
  const {
    externalWalletClient,
    externalWorldContract,
    networkLayer: {
      network,
      components: { PlayerReady },
      utils: { getAvailableLevelSpawns, hasSystemDelegation, getMatchRewards },
      executeSystemWithExternalWallet,
    },
  } = useMUD();

  const {
    components: { Name, Match, MatchConfig, HeroInRotation },
    walletClient,
    worldContract,
  } = network;

  const name = useComponentValue(Name, addressToEntityID(address || ("0x00" as Hex)));
  const [newName, setNewName] = useState(name ? name.value : "");

  const freeHero =
    [...runQuery([HasValue(HeroInRotation, { value: true })])][0] ?? stringToHex("Halberdier", { size: 32 });
  const [hero, setHero] = useState(freeHero as Hex);

  const [pendingTx, setPendingTx] = useState(false);

  const currentPlayer = useCurrentPlayer(matchEntity);
  const playerReadys = useEntityQuery([Has(PlayerReady), HasValue(Match, { matchEntity })]);
  const currentPlayerReady = Boolean(playerReadys.find((i) => i === currentPlayer?.player));

  const matchConfig = useComponentValue(MatchConfig, matchEntity);
  const levelId = matchConfig?.levelId;

  const burnerBalance = useBurnerBalance();
  const matchRewards = getMatchRewards(matchEntity);
  const entranceFeeEth = formatEther(matchRewards.entranceFee);

  const orbBalance = useOrbBalance();

  const { isAllowed, isSeasonPassOnly, hasAllowList } = useIsAllowed(matchEntity);

  const availableSpawns = levelId ? getAvailableLevelSpawns(levelId, matchEntity as Hex) : [];

  const register = async () => {
    if (externalWorldContract) {
      // Used to later notify player of match start
      Notification.requestPermission();

      setPendingTx(true);

      try {
        const hasDelegation =
          externalWalletClient &&
          externalWalletClient.account &&
          hasSystemDelegation(externalWalletClient.account.address, walletClient.account.address, BUILD_SYSTEM_ID);

        const systemCalls = [
          {
            systemId: PLAYER_REGISTER_SYSTEM_ID,
            functionName: "register",
            args: [matchEntity as Hex, availableSpawns[0], hero as Hex],
          },
          {
            systemId: NAME_SYSTEM_ID,
            functionName: "setName",
            args: [newName],
          },
        ] as const satisfies readonly Omit<
          SystemCall<typeof IWorldAbi, ContractFunctionName<typeof IWorldAbi>>,
          "abi"
        >[];

        await executeSystemWithExternalWallet({
          systemCall: "batchCall",
          systemId: "JoinMatch",
          args: [
            [
              encodeSystemCalls(
                IWorldAbi,
                hasDelegation
                  ? systemCalls
                  : [...systemCalls, ...getDelegationSystemCalls(walletClient.account.address)],
              ).map(([systemId, callData]) => ({ systemId, callData })),
            ],
            { account: address },
          ],
        });
      } catch (e) {
        console.error(e);
      } finally {
        setPendingTx(false);
      }
    }
  };

  const sendTx = () => {
    if (externalWalletClient && externalWalletClient.account) {
      return worldContract.write.callFrom(
        encodeSystemCallFrom({
          abi: IWorldAbi,
          from: externalWalletClient.account.address,
          systemId: LOBBY_SYSTEM_ID,
          functionName: "toggleReady",
          args: [matchEntity as Hex],
        }),
      );
    } else {
      // otherwise return a promise to satisfy button types
      return worldContract.write.callFrom(
        encodeSystemCallFrom({
          abi: IWorldAbi,
          from: walletClient.account.address,
          systemId: LOBBY_SYSTEM_ID,
          functionName: "toggleReady",
          args: [matchEntity as Hex],
        }),
      );
    }
  };

  const { nameValid, nameValidityMessage } = useNameIsValid(newName);

  let disabledMessage = "";
  if (!nameValid) disabledMessage = nameValidityMessage;
  if (orbBalance < matchRewards.entranceFee) disabledMessage = `Cannot pay ${entranceFeeEth}🔮`;
  if (!isAllowed && isSeasonPassOnly) disabledMessage = "Season Pass hodlers only";
  if (!isAllowed && hasAllowList) disabledMessage = "You are not on the access list";

  let registerDisabled = false;
  if (!nameValid) registerDisabled = true;
  if (orbBalance < matchRewards.entranceFee) registerDisabled = true;
  if (!isAllowed) registerDisabled = true;

  let joinButtonText = `Join - Free`;
  if (matchRewards.entranceFee > 0n) joinButtonText = `Join - ${entranceFeeEth}🔮`;
  if (registerDisabled) joinButtonText = disabledMessage;
  if (pendingTx) joinButtonText = "Joining...";

  if (!matchEntity) return <></>;

  return (
    <div>
      {!currentPlayer.player && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            register();
          }}
          className="w-full"
        >
          <div className="relative h-fit">
            <input
              type="text"
              className="w-full py-2 px-3 rounded border border-1 border-white bg-[#F4F3F1] flex flex-row"
              placeholder="Enter a name"
              disabled={Boolean(pendingTx || currentPlayer?.player)}
              value={newName}
              onChange={(e) => {
                const name = e.target.value;
                setNewName(name);
                return false;
              }}
            ></input>

            <div
              style={{
                pointerEvents: "none",
                top: `calc(50% - 11px)`,
              }}
              className="absolute right-3 text-ss-text-x-light uppercase"
            >
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
          </div>
        </form>
      )}

      {!currentPlayer.player && !registerDisabled && (
        <>
          <HeroSelect hero={hero} setHero={setHero} />

          <div className="h-4"></div>
        </>
      )}

      <div className="flex">
        <LabeledOrbInput label="Your Balance" amount={orbBalance} />
      </div>

      <div className="h-4"></div>

      <div className="flex row">
        {!currentPlayer?.player && (
          <div className="grow">
            {!pendingTx ? (
              <Button
                disabled={registerDisabled || pendingTx}
                buttonType="secondary"
                className="w-full"
                onClick={() => register()}
              >
                {registerDisabled ? disabledMessage : joinButtonText}
              </Button>
            ) : (
              <Button disabled buttonType="secondary" className="text-2xl w-full">
                Joining...
              </Button>
            )}
          </div>
        )}

        {currentPlayer.player && !currentPlayerReady && (
          <div className="grow">
            <SendTxButton buttonType="secondary" className="w-full" network={network} sendTx={sendTx}>
              ready
            </SendTxButton>
          </div>
        )}

        {currentPlayerReady && (
          <div className="grow">
            <SendTxButton buttonType="secondary" className="w-full" network={network} sendTx={sendTx}>
              unready
            </SendTxButton>
          </div>
        )}
      </div>

      {burnerBalance?.belowDanger && (
        <>
          <div className="h-4"></div>
          <SessionWalletManager />
        </>
      )}
    </div>
  );
};

export const JoinGame = ({ matchEntity }: { matchEntity: Entity }) => {
  const { externalWorldContract } = useMUD();

  const matchLinkRef = useRef<HTMLInputElement>(null);
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  useEffect(() => {
    if (showCopyNotification) {
      setTimeout(() => {
        setShowCopyNotification(false);
      }, 2_000);
    }
  }, [showCopyNotification]);

  const matchInfo = useMatchInfo(matchEntity);
  const allowInfo = useIsAllowed(matchEntity);

  const { address } = useExternalAccount();

  return (
    <div className="w-full">
      <div className="flex flex-row">
        <Heading className="flex flex-row items-center gap-x-1">
          {allowInfo.isSeasonPassOnly && <SeasonPassIcon />}
          {matchInfo.matchName}
        </Heading>
        <div className="w-3"></div>
        <div className="flex flex-row items-center bg-[#F4F3F1] hover:bg-gray border border-1 border-[#DDDAD0] rounded py-1 px-1">
          <ChainSVG
            onClick={() => {
              if (matchLinkRef.current) {
                matchLinkRef.current.select();
                document.execCommand("copy");
                setShowCopyNotification(true);
              }
            }}
          />
        </div>
        <div className="w-3"></div>
        <input
          ref={matchLinkRef}
          className="bg-[#F4F3F1] w-24 text-ss-text-x-light"
          readOnly
          value={`${window.location.origin}${getMatchUrl(matchEntity)}`}
        ></input>
        <div className="w-3"></div>
        {showCopyNotification && <div className="text-ss-text-x-light animate-bounce">Copied!</div>}

        <div className="flex-grow"></div>

        <JoinModal viewOnly matchEntity={matchEntity}>
          <Button buttonType="tertiary">Match Info</Button>
        </JoinModal>
      </div>
      {matchInfo?.matchConfig?.createdBy && <CreatedBy createdBy={matchInfo.matchConfig.createdBy as Hex} />}

      <div className="h-4"></div>

      {address && externalWorldContract ? (
        <RegistrationForm matchEntity={matchEntity} address={address} />
      ) : (
        <div>
          <OverlineSmall>register</OverlineSmall>
          <ConnectButton />
        </div>
      )}
      <div className="h-8"></div>
    </div>
  );
};
