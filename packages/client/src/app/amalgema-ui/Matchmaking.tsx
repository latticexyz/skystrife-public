import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { Modal } from "./Modal";
import { useAmalgema } from "../../useAmalgema";
import { Button } from "../ui/Theme/SkyStrife/Button";
import { Body, OverlineSmall } from "../ui/Theme/SkyStrife/Typography";
import { useExternalAccount } from "./hooks/useExternalAccount";
import { DateTime } from "luxon";
import { useCurrentTime } from "./hooks/useCurrentTime";
import { PromiseButton } from "../ui/hooks/PromiseButton";
import WarningSection from "../ui/Theme/SkyStrife/WarningSection";
import { useOrbBalance } from "./hooks/useOrbBalance";
import { Hex, parseEther } from "viem";
import { DisplayNameUnformatted } from "./CreatedBy";
import { addressToEntityID } from "../../mud/setupNetwork";
import { useJoinMatch } from "./MatchTable/hooks";
import { Entity, HasValue, getComponentValue, runQuery } from "@latticexyz/recs";
import { HeroSelect } from "./HeroSelect";
import { useComponentValue } from "@latticexyz/react";
import { encodeMatchEntity } from "../../encodeMatchEntity";
import { getMatchUrl } from "../../getMatchUrl";
import { Checkbox } from "../ui/Theme/Checkbox";
import { Star } from "../ui/Theme/SkyStrife/Icons/Star";
import Color from "color";
import playerColors from "../../layers/Local/player-colors.json";

type MatchDetails = {
  id: number;
  status: "in_pool" | "pending_match" | "confirmed_match";
  user1: string;
  user2: string;
  user3: string;
  user4: string;
  user1_confirmed: number;
  user2_confirmed: number;
  user3_confirmed: number;
  user4_confirmed: number;
  created_at: number;
};

const UserDisplay = ({
  addressEntity,
  ready,
  color,
  isSelf,
}: {
  addressEntity: Entity;
  ready: boolean;
  color: string;
  isSelf: boolean;
}) => {
  return (
    <div
      className="flex flex-row items-center rounded p-2 px-3 w-full border border-1 border-white"
      style={{
        backgroundColor: color,
      }}
      key={`player-${addressEntity}`}
    >
      <>
        <Checkbox checked={ready} />
        <div className="w-full ml-2 overflow-hidden text-ellipsis text-xl text-black/80 flex row justify-between items-center">
          <DisplayNameUnformatted entity={addressEntity} />
          <div className="flex items-center space-x-2">{isSelf && <Star />}</div>
        </div>
      </>
    </div>
  );
};

export function Matchmaking() {
  const {
    network: {
      components: { HeroInRotation, MatchPlayers, CreatedByAddress },
      networkConfig: { chain },
    },
    utils: { sendAnalyticsEvent },
  } = useAmalgema();

  const getNowSeconds = () => Math.floor(DateTime.now().toSeconds());

  const matchmakingServerUrl =
    chain.id === 690 ? "https://skystrife-matchmaking.onrender.com" : "http://localhost:5201";

  const [isOpen, setIsOpen] = useState(false);
  const { externalWalletClient } = useAmalgema();
  const { address } = useExternalAccount();
  const [status, setStatus] = useState<"idle" | "in_pool" | "pending_match" | "confirmed_match">("idle");
  const [queueCount, setQueueCount] = useState(0);
  const [pendingMatch, setPendingMatch] = useState<MatchDetails | null>(null);
  const [expiryTime, setExpiryTime] = useState<DateTime | null>(null);
  const [isMatchmakingAvailable, setIsMatchmakingAvailable] = useState(false);
  const [queueStartTime, setQueueStartTime] = useState<DateTime | null>(null);
  const [matchEntity, setMatchEntity] = useState<Entity | null>(null);
  const [hero, setHero] = useState<Hex | null>(null);
  const [readySent, setReadySent] = useState(false);
  const [playedSound, setPlayedSound] = useState(false);
  useEffect(() => {
    if (status !== "confirmed_match") return;

    const freeHero = [...runQuery([HasValue(HeroInRotation, { value: true })])][0];
    setHero(freeHero as Hex);
  }, [HeroInRotation, status]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allPlayersInMatch = useComponentValue(MatchPlayers, matchEntity ?? ("0x0" as Entity))?.value ?? [];
  const currentPlayerInMatch = useMemo(
    () =>
      Boolean(
        allPlayersInMatch.find((p) => {
          if (!matchEntity) return false;
          if (!address) return false;

          const createdBy = getComponentValue(CreatedByAddress, encodeMatchEntity(matchEntity, p))?.value as Hex;
          return createdBy === addressToEntityID(address);
        }),
      ),
    [matchEntity, address, allPlayersInMatch, CreatedByAddress],
  );

  const joinMatch = useJoinMatch(matchEntity as Entity, hero as Hex);
  const joinConfirmedMatch = async () => {
    sendAnalyticsEvent("matchmaking:join_match", {
      address,
      createdAt: getNowSeconds(),
    });

    await joinMatch();
  };

  const orbBalance = useOrbBalance();

  const now = useCurrentTime();
  const timeUntilExpiry = useMemo(() => (expiryTime ? expiryTime.diff(now) : null), [expiryTime, now]);
  const timeInQueue = useMemo(() => (queueStartTime ? now.diff(queueStartTime) : null), [queueStartTime, now]);

  const isOrbBalanceSufficient = useMemo(() => orbBalance >= parseEther("25"), [orbBalance]);
  const joinQueueDisabled = useMemo(
    () => !isOrbBalanceSufficient || !isMatchmakingAvailable,
    [isOrbBalanceSufficient, isMatchmakingAvailable],
  );
  let disabledMessage = "";
  if (!isOrbBalanceSufficient) {
    disabledMessage = "Not enough 🔮";
  }
  if (!isMatchmakingAvailable) {
    disabledMessage = "Matchmaking not available";
  }

  let title = "Play now (Beta)";
  if (status === "in_pool") {
    title = "looking for players";
  }
  if (status === "pending_match") {
    title = "Match found!";
  }
  if (status === "confirmed_match") {
    title = "Ready to join";
  }

  const updateUserStatus = useCallback(async () => {
    let status = "idle";

    try {
      const { data } = await axios.get(`${matchmakingServerUrl}/status/${address}`);
      if (data.status !== "pending_match" && readySent) {
        setReadySent(false);
        setPlayedSound(false);
      }

      if (data.status === "in_pool") {
        status = "in_pool";
        setPendingMatch(data.details);
      }

      if (data.status === "confirmed_match") {
        status = "confirmed_match";
        setPendingMatch(data.details);
        setMatchEntity(data.details.match_entity as Entity);
      }

      if (data.status === "pending_match") {
        status = "pending_match";
        setPendingMatch(data.details);
        setExpiryTime(DateTime.fromMillis(data.expiryTime));
        if (!playedSound) {
          setPlayedSound(true);
          const audio = new Audio("/public/assets/bottle_bell_reverb.mp3");
          audio.play();
        }
      } else {
        setPlayedSound(false);
      }

      if (data.status === "idle") {
        status = "idle";
      }
    } catch (error) {
      console.error("Failed to check user status", error);
    }

    setStatus(status as "in_pool" | "pending_match" | "confirmed_match" | "idle");

    return status;
  }, [address, matchmakingServerUrl, playedSound, readySent]);

  // If user is in queue on fresh load automatically open the modal
  useEffect(() => {
    const openOnStatusChange = async () => {
      const status = await updateUserStatus();
      if (status !== "idle") {
        setIsOpen(true);
      }
    };

    openOnStatusChange();
  }, [updateUserStatus]);

  // update queue start time when user joins queue
  useEffect(() => {
    if (status === "in_pool" && !queueStartTime) {
      setQueueStartTime(DateTime.now());
    } else if (status !== "in_pool" && queueStartTime) {
      setQueueStartTime(null);
    }
  }, [status, queueStartTime]);

  useEffect(() => {
    if (!isMatchmakingAvailable) return;
    if (!isOpen) return;

    const updateQueueCount = async () => {
      const { data } = await axios.get(`${matchmakingServerUrl}/pool`);
      setQueueCount(data.length);
    };
    updateQueueCount();
    updateUserStatus();

    const interval = setInterval(async () => {
      updateQueueCount();
      updateUserStatus();
    }, 1_000);

    return () => clearInterval(interval);
  }, [status, address, isOpen, updateUserStatus, isMatchmakingAvailable, matchmakingServerUrl]);

  // check if server is running
  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;
    let intervalTime = 5000; // Start with 5 seconds
    const maxIntervalTime = 60000; // Maximum interval of 1 minute

    const checkMatchmakingAvailability = async () => {
      try {
        await axios.get(`${matchmakingServerUrl}/pool`);
        setIsMatchmakingAvailable(true);
        intervalTime = 5000; // Reset interval time on success
      } catch (error) {
        console.error("Failed to check matchmaking availability", error);
        setIsMatchmakingAvailable(false);
        intervalTime = Math.min(intervalTime * 2, maxIntervalTime); // Double the interval time, up to the max
      } finally {
        timeout = setTimeout(checkMatchmakingAvailability, intervalTime);
      }
    };

    checkMatchmakingAvailability(); // Initial check

    return () => {
      clearTimeout(timeout);
    };
  }, [matchmakingServerUrl]);

  const joinQueue = async () => {
    if (!externalWalletClient || !address) return;

    const message = "Join matchmaking pool";
    const signature = await externalWalletClient.signMessage({
      account: address,
      message,
    });

    await axios.post(`${matchmakingServerUrl}/join`, {
      ethereum_address: address,
      message,
      signature,
    });

    sendAnalyticsEvent("matchmaking:join_queue", {
      address,
      createdAt: getNowSeconds(),
    });

    setStatus("in_pool");
  };

  const leaveQueue = async () => {
    if (!externalWalletClient || !address) return;

    const message = "Leave matchmaking pool";
    const signature = await externalWalletClient.signMessage({
      account: address,
      message,
    });

    await axios.post(`${matchmakingServerUrl}/leave`, {
      ethereum_address: address,
      message,
      signature,
    });

    sendAnalyticsEvent("matchmaking:leave_queue", {
      address,
      createdAt: getNowSeconds(),
    });

    setStatus("idle");
  };

  const readyUp = async () => {
    if (!externalWalletClient || !address || !pendingMatch) return;

    const message = "Ready up for match";
    const signature = await externalWalletClient.signMessage({
      account: address,
      message,
    });

    await axios.post(`${matchmakingServerUrl}/ready-up`, {
      ethereum_address: address,
      match_id: pendingMatch.id,
      message,
      signature,
    });

    sendAnalyticsEvent("matchmaking:ready", {
      address,
      createdAt: getNowSeconds(),
    });

    setReadySent(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      setOpen={status === "idle" ? setIsOpen : undefined}
      title={title}
      trigger={
        <>
          {address && (
            <Button disabled={!isMatchmakingAvailable} buttonType="secondary" onClick={() => setIsOpen(true)}>
              Play Now (Beta)
            </Button>
          )}
        </>
      }
      footer={
        <>
          {status === "idle" && (
            <PromiseButton
              buttonType="primary"
              promise={joinQueue}
              disabled={joinQueueDisabled}
              className="w-1/2 mx-auto"
            >
              {joinQueueDisabled ? disabledMessage : "Join Queue"}
            </PromiseButton>
          )}

          {status === "in_pool" && (
            <PromiseButton buttonType="tertiary" promise={leaveQueue} className="w-1/2 mx-auto">
              Leave Queue
            </PromiseButton>
          )}

          {status === "pending_match" && (
            <PromiseButton disabled={readySent} buttonType="primary" promise={readyUp} className="w-1/2 mx-auto">
              {readySent ? "Waiting for other players" : "Commit to match"}
            </PromiseButton>
          )}

          {status === "confirmed_match" && (
            <>
              {currentPlayerInMatch && matchEntity ? (
                <a href={getMatchUrl(matchEntity)} target="_blank" rel="noopener noreferrer" className="grow">
                  <Button buttonType="primary" className="w-full">
                    Re-Join Match
                  </Button>
                </a>
              ) : (
                <PromiseButton buttonType="primary" promise={joinConfirmedMatch} className="w-1/2 mx-auto">
                  Join Match (Pay 25🔮)
                </PromiseButton>
              )}
            </>
          )}
        </>
      }
    >
      <div className="flex flex-col justify-around">
        {status === "idle" && (
          <>
            <Body className="text-ss-text-default">
              Join a queue to find other players to play with! When 4 players are found, a match will be created and you
              will be able to join.
            </Body>

            <div className="h-4" />

            <WarningSection>
              By entering matchmaking, you commit to pay 25🔮 as an entrance fee to cover the cost of match creation.
            </WarningSection>
          </>
        )}

        {status === "in_pool" && (
          <>
            <div className="flex w-full justify-around">
              <OverlineSmall style={{ fontSize: "1rem" }} className="text-ss-text-default">
                Players in queue: {queueCount}
              </OverlineSmall>
              {timeInQueue && (
                <OverlineSmall style={{ fontSize: "1rem" }} className="text-ss-text-default">
                  Time in queue: {timeInQueue.toFormat("mm:ss")}
                </OverlineSmall>
              )}
            </div>

            <div className="w-full text-center mt-4 text-ss-text-x-light">
              (Enable sound to be notified when a match is found)
            </div>
          </>
        )}

        {status === "pending_match" && pendingMatch && (
          <>
            <div className="flex flex-col space-y-2">
              {(["user1", "user2", "user3", "user4"] as const).map((user, index) => (
                <div key={user} className="flex items-center">
                  <UserDisplay
                    addressEntity={addressToEntityID(pendingMatch[user] as Hex)}
                    ready={pendingMatch[`${user}_confirmed`] !== 0}
                    color={Color(parseInt(Object.keys(playerColors)[index + 1], 16)).toString()}
                    isSelf={pendingMatch[user] === address}
                  />
                </div>
              ))}
            </div>

            <div className="h-4" />

            {timeUntilExpiry && (
              <OverlineSmall className="w-full text-center">
                Time until expiry: {timeUntilExpiry.toFormat("mm:ss")}
              </OverlineSmall>
            )}

            <div
              style={{
                width: "100%",
                height: "24px",
              }}
            >
              <div
                className="bg-ss-gold-hover h-full"
                style={{
                  transition: "width 1s linear",
                  width: `calc(100% * ${Math.max(timeUntilExpiry?.toMillis() || 0, 0) / 60_000})`,
                }}
              ></div>
            </div>
          </>
        )}

        {status === "confirmed_match" && (
          <div className="flex justify-center h-full w-full">
            {hero && <HeroSelect hero={hero} setHero={setHero} />}
            <div className="h-8" />
          </div>
        )}
      </div>
    </Modal>
  );
}
