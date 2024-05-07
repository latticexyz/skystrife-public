import { Entity, getComponentValue, hasComponent, getComponentValueStrict } from "@latticexyz/recs";
import { useCallback } from "react";
import { useAmalgema } from "../../../useAmalgema";
import { LOBBY_SYSTEM_ID, PLAYER_REGISTER_SYSTEM_ID, SEASON_PASS_ONLY_SYSTEM_ID } from "../../../constants";
import { Hex } from "viem";
import { useOrbBalance } from "../hooks/useOrbBalance";
import { useSeasonPassExternalWallet } from "../hooks/useSeasonPass";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { encodeSystemCalls } from "@latticexyz/world/internal";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { getDelegationSystemCalls } from "../../../getDelegationSystemCalls";
import { getMatchUrl } from "../../../getMatchUrl";
import { useExternalAccount } from "../hooks/useExternalAccount";

export function useIsAllowed(matchEntity: Entity) {
  const {
    components: { MatchAccessControl, AllowList },
  } = useAmalgema();

  const matchAccessControl = getComponentValue(MatchAccessControl, matchEntity);
  const hasSeasonPass = useSeasonPassExternalWallet();
  const { address } = useExternalAccount();

  const hasAllowList = hasComponent(AllowList, matchEntity);
  const isSeasonPassOnly = matchAccessControl && matchAccessControl.systemId === SEASON_PASS_ONLY_SYSTEM_ID;

  let isAllowed = true;

  if (hasAllowList) {
    const allowedAccounts = getComponentValueStrict(AllowList, matchEntity).value;
    if (address && !allowedAccounts.includes(address)) isAllowed = false;
    if (!address) isAllowed = false;
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
        systemId: "Join Match",
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
        systemId: "Join Match (New Session Wallet)",
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
