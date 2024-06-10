import { createSkyStrife } from "headless-client/src/createSkyStrife";
import { createMatchEntity } from "client/src/createMatchEntity";
import { getOldestMatchInWindow, getSkypoolConfig } from "client/src/app/amalgema-ui/utils/skypool";
import { COPY_MAP_SYSTEM_ID, MATCH_SYSTEM_ID } from "client/src/constants";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { Hex, stringToHex, padHex, parseEther } from "viem";
import { encodeSystemCalls } from "@latticexyz/world/internal";
import { debug } from "./main";

export const createMatch = async (
  skyStrife: Awaited<ReturnType<typeof createSkyStrife>>,
  levelName: string,
  matchName: string,
): Promise<Hex | undefined> => {
  const { networkLayer } = skyStrife;

  const { executeSystem } = networkLayer;

  const levelId = stringToHex(levelName, { size: 32 });

  const skypoolConfig = getSkypoolConfig(networkLayer);
  if (!skypoolConfig) return;

  const oldestMatchInWindow = getOldestMatchInWindow(
    networkLayer,
    BigInt(Math.round(Date.now() / 1000)),
    skypoolConfig.window,
  );

  const matchEntity = createMatchEntity();
  const systemCalls = [
    {
      systemId: MATCH_SYSTEM_ID,
      functionName: "createMatchSeasonPass",
      args: [
        matchName,
        (oldestMatchInWindow as Hex) ?? matchEntity,
        matchEntity,
        levelId,
        padHex("0x"),
        parseEther("25"),
        [0n, 0n, 0n, 0n, 100n],
      ],
    },
    {
      systemId: COPY_MAP_SYSTEM_ID,
      functionName: "copyMap",
      args: [matchEntity],
    },
  ];

  debug(`Creating match ${matchName}. Level: ${levelName}`);
  await executeSystem({
    systemCall: "batchCall",
    systemId: "CreateMatch",
    args: [[encodeSystemCalls(IWorldAbi, systemCalls).map(([systemId, callData]) => ({ systemId, callData }))], {}],
  });

  return matchEntity;
};
