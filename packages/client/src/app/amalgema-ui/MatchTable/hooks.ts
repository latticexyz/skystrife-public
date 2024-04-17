import { Entity, Has, getComponentValue, runQuery } from "@latticexyz/recs";
import { useCallback } from "react";
import { useAmalgema } from "../../../useAmalgema";
import {
  ALLOW_LIST_SYSTEM_ID,
  LOBBY_SYSTEM_ID,
  PLAYER_REGISTER_SYSTEM_ID,
  SEASON_PASS_ONLY_SYSTEM_ID,
} from "../../../constants";
import { Hex } from "viem";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { useOrbBalance } from "../hooks/useOrbBalance";
import { useSeasonPassExternalWallet } from "../hooks/useSeasonPass";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { encodeSystemCalls } from "@latticexyz/world/internal";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { getDelegationSystemCalls } from "../../../getDelegationSystemCalls";
import { getMatchUrl } from "../../../getMatchUrl";

export function useIsAllowed(matchEntity: Entity) {
  const {
    network: {
      components: { MatchAccessControl, MatchAllowed },
    },
    externalWalletClient,
  } = useAmalgema();

  const matchAccessControl = getComponentValue(MatchAccessControl, matchEntity);
  const hasSeasonPass = useSeasonPassExternalWallet();

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
          account === externalWalletClient.account.address,
      );
  }

  if (isSeasonPassOnly) {
    isAllowed = hasSeasonPass;
  }

  return { isAllowed, hasAllowList, isSeasonPassOnly };
}

export function useCanAffordEntrance(matchEntity: Entity) {
  const {
    network: {
      components: { MatchSweepstake },
    },
  } = useAmalgema();

  const matchSweepstake = getComponentValue(MatchSweepstake, matchEntity);
  const orbBalance = useOrbBalance();

  return {
    canAffordEntrance: !matchSweepstake || orbBalance >= matchSweepstake.entranceFee,
    orbBalance,
  };
}

export function useJoinMatch(matchEntity: Entity, hero: Hex) {
  const {
    network: {
      components: { MatchConfig },
      walletClient,
      publicClient,
    },
    utils: { getAvailableLevelSpawns, hasSystemDelegation },
    externalWalletClient,
    executeSystemWithExternalWallet,
    externalWorldContract,
  } = useAmalgema();

  const { openConnectModal } = useConnectModal();
  const matchConfig = getComponentValue(MatchConfig, matchEntity);

  return useCallback(async () => {
    if (!externalWalletClient) {
      if (openConnectModal) openConnectModal();
      return;
    }

    if (!matchConfig) return;
    if (!externalWorldContract) return;
    if (externalWalletClient.account?.address === undefined) return;

    const spawns = getAvailableLevelSpawns(matchConfig.levelId, matchEntity as Hex);

    const spawn = spawns[Math.floor(Math.random() * spawns.length)];

    const hasDelegation = hasSystemDelegation(
      externalWalletClient.account.address,
      walletClient.account.address,
      LOBBY_SYSTEM_ID,
    );

    if (hasDelegation) {
      await executeSystemWithExternalWallet({
        systemCall: "register",
        args: [
          [matchEntity as Hex, spawn, hero],
          {
            account: externalWalletClient.account.address,
          },
        ],
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
          {
            account: externalWalletClient.account.address,
          },
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
    walletClient.account.address,
  ]);
}
