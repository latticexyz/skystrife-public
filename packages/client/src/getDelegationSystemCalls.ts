import { SystemCall } from "@latticexyz/world";
import { Hex, encodeFunctionData, maxUint256 } from "viem";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { BUILD_SYSTEM_ID, CORE_SYSTEM_ID, LOBBY_SYSTEM_ID, MOVE_SYSTEM_ID, SYSTEMBOUND_DELEGATION } from "./constants";
import { DelegationAbi } from "./app/ui/Admin/delegationAbi";

const GAMEPLAY_SYSTEMS = [LOBBY_SYSTEM_ID, MOVE_SYSTEM_ID, BUILD_SYSTEM_ID];

export function getDelegationSystemCalls(delegatee: Hex): readonly Omit<SystemCall<typeof IWorldAbi>, "abi">[] {
  return GAMEPLAY_SYSTEMS.map((systemId) => ({
    systemId: CORE_SYSTEM_ID,
    functionName: "registerDelegation",
    args: [
      delegatee,
      SYSTEMBOUND_DELEGATION,
      encodeFunctionData({
        abi: DelegationAbi,
        functionName: "initDelegation",
        args: [delegatee, systemId, maxUint256],
      }),
    ],
  }));
}
