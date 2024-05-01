import { useState } from "react";
import { useAmalgema } from "../../../useAmalgema";
import { Button } from "../../ui/Theme/SkyStrife/Button";
import { createMatchEntity } from "../../../createMatchEntity";
import { Hex, padHex } from "viem";
import { SystemCall, encodeSystemCalls } from "@latticexyz/world/internal";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { getMatchUrl } from "../../../getMatchUrl";
import { useSkyPoolConfig } from "../hooks/useSkyPoolConfig";
import { useOrbBalance } from "../hooks/useOrbBalance";
import {
  ALLOW_LIST_SYSTEM_ID,
  COPY_MAP_SYSTEM_ID,
  LOBBY_SYSTEM_ID,
  MATCH_SYSTEM_ID,
  PLAYER_REGISTER_SYSTEM_ID,
  SEASON_PASS_ONLY_SYSTEM_ID,
} from "../../../constants";
import { getDelegationSystemCalls } from "../../../getDelegationSystemCalls";
import { useHasSkyKeyExternalWallet } from "../hooks/useHasSkyKey";
import { findOldestMatchInWindow } from "../utils/skypool";
import { HeroModal } from "../HeroSelect";
import * as Dialog from "@radix-ui/react-dialog";
import { HasValue, runQuery } from "@latticexyz/recs";

export function Footer({
  matchName,
  levelId,
  matchType,
  entranceFee,
  rewardPercentages,
  allowedAddresses,
  close,
}: {
  matchName: string;
  levelId: Hex;
  matchType: "public" | "private" | "season-pass";
  allowedAddresses: Hex[];
  entranceFee: bigint;
  rewardPercentages: bigint[];
  close: () => void;
}) {
  const networkLayer = useAmalgema();
  const {
    externalWalletClient,
    network: { walletClient },
    utils: { getLevelSpawns, hasSystemDelegation },
    externalWorldContract,
    executeSystemWithExternalWallet,
    components: { HeroInRotation },
  } = networkLayer;

  const skypoolConfig = useSkyPoolConfig();
  const orbBalance = useOrbBalance();

  const hasSkyKey = useHasSkyKeyExternalWallet();

  const [txPending, setTxPending] = useState(false);

  const freeHero = [...runQuery([HasValue(HeroInRotation, { value: true })])][0];
  const [hero, setHero] = useState(freeHero as Hex);

  const spawnsInLevel = getLevelSpawns(levelId);
  const numPlayers = spawnsInLevel.length;

  const executeMatchSystem = async (systemFunc: () => Promise<unknown>) => {
    if (txPending || !externalWorldContract) return;
    setTxPending(true);

    let success = false;
    try {
      await systemFunc();
      success = true;
    } catch (e) {
      console.error(e);
    }

    setTxPending(false);
    if (success) close();
  };

  const createPublicMatch = async () => {
    executeMatchSystem(async () => {
      const matchEntity = createMatchEntity();

      const systemCalls: readonly Omit<SystemCall<typeof IWorldAbi>, "abi">[] = [
        // create a match
        {
          systemId: MATCH_SYSTEM_ID,
          functionName: "createMatch",
          args: [matchName, (findOldestMatchInWindow(networkLayer) || matchEntity) as Hex, matchEntity, levelId],
        },
        {
          systemId: COPY_MAP_SYSTEM_ID,
          functionName: "copyMap",
          args: [matchEntity],
        },
      ];

      await executeSystemWithExternalWallet({
        systemCall: "batchCall",
        systemId: "Create Match",
        args: [[encodeSystemCalls(IWorldAbi, systemCalls).map(([systemId, callData]) => ({ systemId, callData }))]],
      });
    });
  };

  const createSeasonPassHolderOnlyMatch = async () => {
    executeMatchSystem(async () => {
      const matchEntity = createMatchEntity();

      const systemCalls: readonly Omit<SystemCall<typeof IWorldAbi>, "abi">[] = [
        {
          systemId: MATCH_SYSTEM_ID,
          functionName: "createMatchSeasonPass",
          args: [
            matchName,
            (findOldestMatchInWindow(networkLayer) || matchEntity) as Hex,
            matchEntity,
            levelId,
            SEASON_PASS_ONLY_SYSTEM_ID,
            entranceFee,
            rewardPercentages,
          ],
        },
        {
          systemId: COPY_MAP_SYSTEM_ID,
          functionName: "copyMap",
          args: [matchEntity],
        },
      ];

      await executeSystemWithExternalWallet({
        systemCall: "batchCall",
        systemId: "Create Match",
        args: [[encodeSystemCalls(IWorldAbi, systemCalls).map(([systemId, callData]) => ({ systemId, callData }))]],
      });
    });
  };

  const createAndJoinPublicMatch = async () => {
    executeMatchSystem(async () => {
      const matchEntity = createMatchEntity();
      const spawnsInLevel = getLevelSpawns(levelId);

      const hasDelegation =
        externalWalletClient &&
        externalWalletClient.account &&
        hasSystemDelegation(externalWalletClient.account.address, walletClient.account.address, LOBBY_SYSTEM_ID);

      const systemCalls = [
        // create a match
        {
          systemId: MATCH_SYSTEM_ID,
          functionName: "createMatch",
          args: [matchName, (findOldestMatchInWindow(networkLayer) || matchEntity) as Hex, matchEntity, levelId],
        },
        // register the match creator
        {
          systemId: PLAYER_REGISTER_SYSTEM_ID,
          functionName: "register",
          args: [matchEntity, spawnsInLevel[0], hero],
        },
        {
          systemId: COPY_MAP_SYSTEM_ID,
          functionName: "copyMap",
          args: [matchEntity],
        },
      ];

      await executeSystemWithExternalWallet({
        systemCall: "batchCall",
        systemId: "Create and Join Match",
        args: [
          [
            encodeSystemCalls(
              IWorldAbi,
              hasDelegation ? systemCalls : [...systemCalls, ...getDelegationSystemCalls(walletClient.account.address)],
            ).map(([systemId, callData]) => ({ systemId, callData })),
          ],
        ],
      });

      const matchUrl = getMatchUrl(matchEntity);
      window.location.assign(matchUrl);
    });
  };

  const createPrivateMatch = async () => {
    executeMatchSystem(async () => {
      const matchEntity = createMatchEntity();
      await executeSystemWithExternalWallet({
        systemCall: "batchCall",
        systemId: "Create Private Match",
        args: [
          [
            encodeSystemCalls(IWorldAbi, [
              // create a match with an access list
              {
                systemId: MATCH_SYSTEM_ID,
                functionName: "createMatchSeasonPass",
                args: [
                  matchName,
                  (findOldestMatchInWindow(networkLayer) || matchEntity) as Hex,
                  matchEntity,
                  levelId,
                  ALLOW_LIST_SYSTEM_ID,
                  entranceFee,
                  rewardPercentages,
                ],
              },
              // set the access list
              {
                systemId: ALLOW_LIST_SYSTEM_ID,
                functionName: "setMembers",
                args: [matchEntity, allowedAddresses],
              },
              {
                systemId: COPY_MAP_SYSTEM_ID,
                functionName: "copyMap",
                args: [matchEntity],
              },
            ]).map(([systemId, callData]) => ({ systemId, callData })),
          ],
        ],
      });
    });
  };

  const createPublicMatchSeasonPass = async () => {
    executeMatchSystem(async () => {
      const matchEntity = createMatchEntity();

      const systemCalls: readonly Omit<SystemCall<typeof IWorldAbi>, "abi">[] = [
        // create a match
        {
          systemId: MATCH_SYSTEM_ID,
          functionName: "createMatchSeasonPass",
          args: [
            matchName,
            (findOldestMatchInWindow(networkLayer) || matchEntity) as Hex,
            matchEntity,
            levelId,
            padHex("0x", { size: 32 }),
            entranceFee,
            rewardPercentages,
          ],
        },
        {
          systemId: COPY_MAP_SYSTEM_ID,
          functionName: "copyMap",
          args: [matchEntity],
        },
      ];

      await executeSystemWithExternalWallet({
        systemCall: "batchCall",
        systemId: "Create Match",
        args: [
          [encodeSystemCalls(IWorldAbi, [...systemCalls]).map(([systemId, callData]) => ({ systemId, callData }))],
        ],
      });
    });
  };

  const createAndJoinPublicMatchSeasonPass = async () => {
    executeMatchSystem(async () => {
      const matchEntity = createMatchEntity();

      const hasDelegation =
        externalWalletClient &&
        externalWalletClient.account &&
        hasSystemDelegation(externalWalletClient.account.address, walletClient.account.address, LOBBY_SYSTEM_ID);

      const systemCalls: readonly Omit<SystemCall<typeof IWorldAbi>, "abi">[] = [
        // create a match
        {
          systemId: MATCH_SYSTEM_ID,
          functionName: "createMatchSeasonPass",
          args: [
            matchName,
            (findOldestMatchInWindow(networkLayer) || matchEntity) as Hex,
            matchEntity,
            levelId,
            padHex("0x", { size: 32 }),
            entranceFee,
            rewardPercentages,
          ],
        },
        // register the match creator
        {
          systemId: PLAYER_REGISTER_SYSTEM_ID,
          functionName: "register",
          args: [matchEntity, spawnsInLevel[0], hero],
        },
        {
          systemId: COPY_MAP_SYSTEM_ID,
          functionName: "copyMap",
          args: [matchEntity],
        },
      ];

      await executeSystemWithExternalWallet({
        systemCall: "batchCall",
        systemId: "Create and Join Match",
        args: [
          [
            encodeSystemCalls(
              IWorldAbi,
              hasDelegation ? systemCalls : [...systemCalls, ...getDelegationSystemCalls(walletClient.account.address)],
            ).map(([systemId, callData]) => ({ systemId, callData })),
          ],
        ],
      });

      const matchUrl = getMatchUrl(matchEntity);
      window.location.assign(matchUrl);
    });
  };

  const createAndJoinPrivateMatch = async () => {
    executeMatchSystem(async () => {
      const matchEntity = createMatchEntity();

      const hasDelegation =
        externalWalletClient &&
        externalWalletClient.account &&
        hasSystemDelegation(externalWalletClient.account.address, walletClient.account.address, LOBBY_SYSTEM_ID);

      const systemCalls: readonly Omit<SystemCall<typeof IWorldAbi>, "abi">[] = [
        // create a match with an access list
        {
          systemId: MATCH_SYSTEM_ID,
          functionName: "createMatchSeasonPass",
          args: [
            matchName,
            (findOldestMatchInWindow(networkLayer) || matchEntity) as Hex,
            matchEntity,
            levelId,
            ALLOW_LIST_SYSTEM_ID,
            entranceFee,
            rewardPercentages,
          ],
        },
        // set the access list
        {
          systemId: ALLOW_LIST_SYSTEM_ID,
          functionName: "setMembers",
          args: [matchEntity, allowedAddresses],
        },
        // register the match creator
        {
          systemId: PLAYER_REGISTER_SYSTEM_ID,
          functionName: "register",
          args: [matchEntity, spawnsInLevel[0], hero],
        },
        {
          systemId: COPY_MAP_SYSTEM_ID,
          functionName: "copyMap",
          args: [matchEntity],
        },
      ];

      await executeSystemWithExternalWallet({
        systemCall: "batchCall",
        systemId: "Create and Join Private Match",
        args: [
          [
            encodeSystemCalls(
              IWorldAbi,
              hasDelegation ? systemCalls : [...systemCalls, ...getDelegationSystemCalls(walletClient.account.address)],
            ).map(([systemId, callData]) => ({ systemId, callData })),
          ],
        ],
      });

      const matchUrl = getMatchUrl(matchEntity);
      window.location.assign(matchUrl);
    });
  };

  const createAndJoinSeasonPassHolderOnlyMatch = async () => {
    executeMatchSystem(async () => {
      const matchEntity = createMatchEntity();

      const hasDelegation =
        externalWalletClient &&
        externalWalletClient.account &&
        hasSystemDelegation(externalWalletClient.account.address, walletClient.account.address, LOBBY_SYSTEM_ID);

      const systemCalls: readonly Omit<SystemCall<typeof IWorldAbi>, "abi">[] = [
        // create a match
        {
          systemId: MATCH_SYSTEM_ID,
          functionName: "createMatchSeasonPass",
          args: [
            matchName,
            (findOldestMatchInWindow(networkLayer) || matchEntity) as Hex,
            matchEntity,
            levelId,
            SEASON_PASS_ONLY_SYSTEM_ID,
            entranceFee,
            rewardPercentages,
          ],
        },
        // register the match creator
        {
          systemId: PLAYER_REGISTER_SYSTEM_ID,
          functionName: "register",
          args: [matchEntity, spawnsInLevel[0], hero],
        },
        {
          systemId: COPY_MAP_SYSTEM_ID,
          functionName: "copyMap",
          args: [matchEntity],
        },
      ];

      await executeSystemWithExternalWallet({
        systemCall: "batchCall",
        systemId: "Create and Join Match",
        args: [
          [
            encodeSystemCalls(
              IWorldAbi,
              hasDelegation ? systemCalls : [...systemCalls, ...getDelegationSystemCalls(walletClient.account.address)],
            ).map(([systemId, callData]) => ({ systemId, callData })),
          ],
        ],
      });

      const matchUrl = getMatchUrl(matchEntity);
      window.location.assign(matchUrl);
    });
  };

  const blankName = matchName.length === 0;
  const blankLevel = levelId.length === 0;
  const notEnoughAllowedAddresses = matchType === "private" && allowedAddresses.length !== numPlayers;
  const invalidRewardPercentages = entranceFee > 0 && rewardPercentages.reduce((acc, curr) => acc + curr, 0n) !== 100n;
  const notEnoughOrbs = !hasSkyKey && (orbBalance ?? 0n) < (skypoolConfig?.cost ?? 0n);

  const disabled =
    notEnoughOrbs || blankName || blankLevel || notEnoughAllowedAddresses || txPending || invalidRewardPercentages;

  let error = "";
  if (blankLevel) error = "Please select a level";
  if (notEnoughAllowedAddresses) error = "Please select enough players to fill the match";

  let createAction = createPublicMatch;
  if (entranceFee > 0) createAction = createPublicMatchSeasonPass;
  if (matchType === "private") createAction = createPrivateMatch;
  if (matchType === "season-pass") createAction = createSeasonPassHolderOnlyMatch;

  let createAndJoinAction = createAndJoinPublicMatch;
  if (entranceFee > 0) createAndJoinAction = createAndJoinPublicMatchSeasonPass;
  if (matchType === "private") createAndJoinAction = createAndJoinPrivateMatch;
  if (matchType === "season-pass") createAndJoinAction = createAndJoinSeasonPassHolderOnlyMatch;

  return (
    <div className="absolute bottom-0 left-0 py-4 px-6 bg-white border-t border-ss-stroke flex flex-row w-full z-50">
      <Button
        buttonType="primary"
        className="w-full shadow-ss-small disabled:shadow-ss-small active:shadow-ss-small-active"
        disabled={disabled}
        onClick={createAction}
      >
        {txPending ? "creating..." : "create match"}
      </Button>

      <div className="w-8" />

      <HeroModal
        hero={hero}
        setHero={setHero}
        trigger={
          <Button disabled={disabled} buttonType="secondary" className="w-full">
            create and join match
          </Button>
        }
        footer={
          <div className="flex w-full gap-x-4 justify-between">
            <Dialog.Close asChild>
              <Button className="w-full" buttonType="tertiary">
                cancel
              </Button>
            </Dialog.Close>
            <Button onClick={createAndJoinAction} disabled={disabled} buttonType="primary" className="w-full">
              {txPending ? "creating..." : "create and join match"}
            </Button>
          </div>
        }
      />
    </div>
  );
}
