import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, getComponentValue } from "@latticexyz/recs";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAmalgema } from "../../../useAmalgema";
import { BrutalistCard } from "../Theme/BrutalistCard";
import { DisplayLevel } from "./DisplayLevel";
import { Hex, encodeFunctionData, hexToString, maxUint256, padHex } from "viem";
import { createMatchEntity } from "../../../createMatchEntity";
import useOnClickOutside from "../hooks/useOnClickOutside";
import { OverlineLarge } from "../Theme/SkyStrife/Typography";
import { CrossIcon } from "../Theme/CrossIcon";
import { Button } from "../Theme/SkyStrife/Button";
import { MATCH_SYSTEM_ID, SEASON_PASS_ONLY_SYSTEM_ID, SYSTEMBOUND_DELEGATION } from "../../../constants";
import { DateTime } from "luxon";
import useLocalStorageState from "use-local-storage-state";
import { PromiseButton } from "../hooks/PromiseButton";
import { useExternalAccount } from "../hooks/useExternalAccount";
import { DelegationAbi } from "../Admin/delegationAbi";
import { encodeSystemCallFrom } from "@latticexyz/world/internal";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { findOldestMatchInWindow } from "../../amalgema-ui/utils/skypool";
import { createMatchTimes } from "../../amalgema-ui/utils/matchSchedule";

function nowGmt() {
  return DateTime.now().setZone("GMT");
}

export const CreateMatch = ({ close }: { close: () => void }) => {
  const networkLayer = useAmalgema();
  const {
    externalWorldContract,
    externalWalletClient,
    network: {
      components: { LevelTemplates, LevelInStandardRotation, LevelInSeasonPassRotation },
      waitForTransaction,
      walletClient,
      worldContract,
    },
    utils: { hasSystemDelegation },
  } = networkLayer;

  const [now, setNow] = useState(nowGmt());
  const matchTimes = useMemo(() => createMatchTimes(now), [now]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(nowGmt());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const [matchName, setMatchName] = useState<string>("");
  const [level, setLevel] = useState<string | undefined>();
  const [registrationTime, setRegistrationTime] = useLocalStorageState("registration-time", {
    defaultValue: Math.floor(DateTime.now().toSeconds()),
  });
  const [seasonPassOnly, setSeasonPassOnly] = useState(false);
  const [numToCreate, setNumToCreate] = useState(1);

  const { address } = useExternalAccount();
  const hasDelegation = address ? hasSystemDelegation(address, walletClient.account.address, MATCH_SYSTEM_ID) : false;

  const ref = useRef<HTMLDivElement>(null);

  const names = useEntityQuery([Has(LevelTemplates)])
    .filter((levelId) => {
      const inRotation =
        getComponentValue(LevelInStandardRotation, levelId)?.value ||
        getComponentValue(LevelInSeasonPassRotation, levelId)?.value;
      return inRotation;
    })
    .map((id) => {
      return { id, name: hexToString(id as Hex, { size: 32 }) };
    });

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };

    document.addEventListener("keydown", listener);

    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, [close]);

  useOnClickOutside(ref, close);

  return (
    <div
      style={{
        background: "rgba(24, 23, 16, 0.65)",
        zIndex: 100,
      }}
      className="fixed top-0 left-0 w-screen h-screen flex flex-col justify-around"
    >
      <div ref={ref} className="mx-auto">
        <BrutalistCard className="w-96 h-fit">
          <div className="p-8">
            <div className="flex w-full justify-between">
              <OverlineLarge>Create Match</OverlineLarge>

              <div className="w-10" />

              <Button buttonType="tertiary" onClick={close} className="h-fit">
                <CrossIcon />
              </Button>
            </div>

            <div className="flex flex-col">
              {!hasDelegation && (
                <div>
                  <OverlineLarge>Give permission for burner wallet to create matches</OverlineLarge>
                  <div className="flex flex-col m-2">
                    <PromiseButton
                      buttonType="primary"
                      disabled={hasDelegation}
                      promise={async () => {
                        if (!externalWorldContract) return;
                        if (!externalWalletClient || !externalWalletClient.account) return;

                        const account = externalWalletClient.account;

                        return await externalWorldContract.write.registerDelegation(
                          [
                            walletClient.account.address,
                            SYSTEMBOUND_DELEGATION,
                            encodeFunctionData({
                              abi: DelegationAbi,
                              functionName: "initDelegation",
                              args: [walletClient.account.address, MATCH_SYSTEM_ID, maxUint256],
                            }),
                          ],
                          {
                            account: account.address,
                          }
                        );
                      }}
                    >
                      Delegate
                    </PromiseButton>
                  </div>
                </div>
              )}

              <div className="flex flex-row justify-between p-1">
                <div>
                  <div className="text-xl">Options</div>
                  <div>
                    Match Name (will be the same for all matches created):
                    <input
                      type="text"
                      value={matchName}
                      onChange={(e) => setMatchName(e.target.value)}
                      placeholder="Match Name"
                      maxLength={24}
                    />
                  </div>
                  Level:
                  <select value={level} onChange={(e) => setLevel(e.target.value as Entity)}>
                    <option value={undefined}>Select a level</option>
                    {names.map(({ id, name }) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="h-4" />

              <div>
                <label htmlFor="registration-time">Registration Time (epoch time):</label>
                <input
                  type="number"
                  id="registration-time"
                  value={registrationTime}
                  onChange={(e) => setRegistrationTime(Number(e.target.value))}
                  min={DateTime.now().toSeconds()}
                />

                <div className="flex w-full">
                  {matchTimes.map((time) => (
                    <Button
                      key={time.toSeconds()}
                      buttonType="secondary"
                      onClick={() => {
                        setRegistrationTime(time.toSeconds());
                      }}
                    >
                      {time.toFormat("HH:mm:ss")}
                    </Button>
                  ))}
                </div>

                <div>
                  Local Time:{" "}
                  <span className="text-ss-blue-hover bg-grey-500">
                    {DateTime.fromSeconds(registrationTime).toFormat("yyyy-MM-dd HH:mm:ss")}
                  </span>{" "}
                  <br />
                  UTC Time:{" "}
                  <span className="text-ss-blue-hover bg-grey-500">
                    {DateTime.fromSeconds(registrationTime).toUTC().toFormat("yyyy-MM-dd HH:mm:ss")}{" "}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="season-pass-only">Season Pass Only:</label>
                <input
                  type="checkbox"
                  id="season-pass-only"
                  checked={seasonPassOnly}
                  onChange={(e) => setSeasonPassOnly(e.target.checked)}
                />
              </div>

              <div>
                <label htmlFor="num-to-create">Number to Create:</label>
                <input
                  type="number"
                  id="num-to-create"
                  value={numToCreate}
                  onChange={(e) => setNumToCreate(Number(e.target.value))}
                  min={1}
                />
              </div>

              <div className="h-4" />

              <PromiseButton
                className="m-1"
                disabled={!level || level === "Select a level"}
                buttonType="secondary"
                promise={async () => {
                  if (!externalWorldContract || !address) return;

                  const creationTxs = [];
                  const matchEntities = [];
                  for (let i = 0; i < numToCreate; i++) {
                    const matchEntity = createMatchEntity();
                    matchEntities.push(matchEntity);

                    const hash = await worldContract.write.callFrom(
                      encodeSystemCallFrom({
                        abi: IWorldAbi,
                        from: address,
                        systemId: MATCH_SYSTEM_ID,
                        functionName: "createMatchSkyKey",
                        args: [
                          matchName,
                          (findOldestMatchInWindow(networkLayer) ?? matchEntity) as Hex,
                          matchEntity,
                          level as Hex,
                          seasonPassOnly ? SEASON_PASS_ONLY_SYSTEM_ID : padHex("0x"),
                          0n,
                          [],
                          BigInt(registrationTime),
                        ],
                      })
                    );

                    const receipt = waitForTransaction(hash);
                    creationTxs.push(receipt);
                  }

                  await Promise.all(creationTxs);

                  for (const matchEntity of matchEntities) {
                    await worldContract.write.copyMap([matchEntity]);
                  }

                  close();
                }}
              >
                Create
              </PromiseButton>
            </div>

            {level && level !== "Select a level" && <DisplayLevel level={level as Hex} />}
          </div>
        </BrutalistCard>
      </div>
    </div>
  );
};
