import { useAmalgema } from "../../../useAmalgema";
import { Has, getComponentValueStrict, runQuery } from "@latticexyz/recs";
import { useEntityQuery } from "@latticexyz/react";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { DisplayNameUnformatted } from "../../amalgema-ui/CreatedBy";
import { addressToEntityID } from "../../../mud/setupNetwork";
import { hexToResource } from "@latticexyz/common";
import { Hex } from "viem";
import { SYSTEMBOUND_DELEGATION } from "../../../constants";

export function Delegations() {
  const {
    components: { UserDelegationControl, SystemboundDelegations },
  } = useAmalgema();

  const delegations = useEntityQuery([Has(UserDelegationControl)]).map((entity) => {
    const { delegator, delegatee } = decodeEntity(UserDelegationControl.metadata.keySchema, entity);

    const { delegationControlId } = getComponentValueStrict(UserDelegationControl, entity);

    let systemNames;
    if (delegationControlId === SYSTEMBOUND_DELEGATION) {
      systemNames = Array.from(runQuery([Has(SystemboundDelegations)]))
        .map((e) => decodeEntity(SystemboundDelegations.metadata.keySchema, e))
        .filter((key) => key.delegator === delegator && key.delegatee === delegatee)
        .map((key) => hexToResource(key.systemId).name);
    }

    return { delegator, delegatee, delegationControlId, systemNames };
  });

  return (
    <div>
      <div className="flex flex-col">
        <div className="w-full text-3xl text-left p-1">Delegations</div>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
