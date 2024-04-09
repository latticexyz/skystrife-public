import { ContractFunctionName, Hex, encodeFunctionData, maxUint256 } from "viem";
import {
  BUILD_SYSTEM_ID,
  WORLD_REGISTRATION_SYSTEM_ID,
  LOBBY_SYSTEM_ID,
  MOVE_SYSTEM_ID,
  SYSTEMBOUND_DELEGATION,
} from "./constants";
import { DelegationAbi } from "./app/ui/Admin/delegationAbi";
import { SystemCall } from "@latticexyz/world/internal";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";

const GAMEPLAY_SYSTEMS = [LOBBY_SYSTEM_ID, MOVE_SYSTEM_ID, BUILD_SYSTEM_ID];

export function getDelegationSystemCalls(delegatee: Hex) {
  return GAMEPLAY_SYSTEMS.map((systemId) => ({
    systemId: WORLD_REGISTRATION_SYSTEM_ID,
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
  })) satisfies readonly Omit<SystemCall<typeof IWorldAbi, ContractFunctionName<typeof IWorldAbi>>, "abi">[];
}
