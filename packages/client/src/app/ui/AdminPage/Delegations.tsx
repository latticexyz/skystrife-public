import { useAmalgema } from "../../../useAmalgema";
import { useState } from "react";
import { Has, getComponentValueStrict, runQuery } from "@latticexyz/recs";
import { useEntityQuery } from "@latticexyz/react";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { DisplayNameUnformatted } from "../../amalgema-ui/CreatedBy";
import { addressToEntityID } from "../../../mud/setupNetwork";
import { hexToResource, resourceToHex } from "@latticexyz/common";
import { Hex, encodeFunctionData, maxUint256 } from "viem";
import { ALL_SYSTEMS, SYSTEMBOUND_DELEGATION } from "../../../constants";
import { useSkyKeyHolder } from "../../amalgema-ui/hooks/useHasSkyKey";
import { PromiseButton } from "../hooks/PromiseButton";
import { DelegationAbi } from "../Admin/delegationAbi";
import { Input } from "../Theme/SkyStrife/Input";

export function Delegations() {
  const {
    components: { UserDelegationControl, SystemboundDelegations },
    externalWorldContract,
    network: { waitForTransaction },
  } = useAmalgema();

  const [systemId, setSystemId] = useState<string>("");
  const [delegateeAddress, setDelegateeAddress] = useState<string>("");

  const skyKeyHolder = useSkyKeyHolder();

  const delegations = useEntityQuery([Has(UserDelegationControl)])
    .map((entity) => {
      const { delegator, delegatee } = decodeEntity(UserDelegationControl.metadata.keySchema, entity);
      if (delegator.toLowerCase() !== skyKeyHolder.address?.toLowerCase()) return null;

      const { delegationControlId } = getComponentValueStrict(UserDelegationControl, entity);

      let systemNames;
      if (delegationControlId === SYSTEMBOUND_DELEGATION) {
        systemNames = Array.from(runQuery([Has(SystemboundDelegations)]))
          .map((e) => decodeEntity(SystemboundDelegations.metadata.keySchema, e))
          .filter((key) => key.delegator === delegator && key.delegatee === delegatee)
          .map((key) => hexToResource(key.systemId).name);
      }

      return { delegator, delegatee, delegationControlId, systemNames };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null);

  return (
    <div>
      <div className="flex flex-col">
        <div className="w-full text-3xl text-left p-1">Delegations</div>
      </div>
      <div>
        <div>System</div>
        <div>
          <select value={systemId} onChange={(e) => setSystemId(e.target.value)}>
            {ALL_SYSTEMS.map((system) => (
              <option key={system} value={system}>
                {hexToResource(system).name}
              </option>
            ))}
          </select>
        </div>
        <div>Delegatee Address</div>
        <div>
          <Input value={delegateeAddress} setValue={setDelegateeAddress} label="Delegatee Address" />
        </div>
        <div>
          <PromiseButton
            disabled={!delegateeAddress || !systemId}
            buttonType="primary"
            promise={async () => {
              if (!externalWorldContract) return;
              if (!skyKeyHolder.address) return;

              const tx = await externalWorldContract.write.registerDelegation(
                [
                  delegateeAddress as Hex,
                  SYSTEMBOUND_DELEGATION,
                  encodeFunctionData({
                    abi: DelegationAbi,
                    functionName: "initDelegation",
                    args: [delegateeAddress as Hex, systemId as Hex, maxUint256],
                  }),
                ],
                {
                  account: skyKeyHolder.address,
                },
              );

              await waitForTransaction(tx);
            }}
          >
            Register
          </PromiseButton>
        </div>
      </div>

      <table className="w-full text-lg text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xl text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th>Delegator</th>
            <th>Delegatee</th>
            <th>Type</th>
            <th>Systems</th>
          </tr>
        </thead>
        <tbody>
          {delegations.map(({ delegator, delegatee, delegationControlId, systemNames }, i) => (
            <tr key={i} className="border-4">
              <td>
                <DisplayNameUnformatted entity={addressToEntityID(delegator)} />
              </td>
              <td>
                <DisplayNameUnformatted entity={addressToEntityID(delegatee)} />
              </td>
              <td>{hexToResource(delegationControlId as Hex).name}</td>
              <td>{systemNames ? systemNames.join(",") : null}</td>
              <td>
                <PromiseButton
                  buttonType="danger"
                  promise={async () => {
                    if (!externalWorldContract) return;
                    if (!skyKeyHolder.address) return;

                    await externalWorldContract.write.unregisterDelegation([delegatee], {
                      account: skyKeyHolder.address,
                    });
                  }}
                >
                  Delete
                </PromiseButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
