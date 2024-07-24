import { resourceToHex } from "@latticexyz/common";
import { SyncFilter } from "@latticexyz/store-sync";
import { defineTable } from "@latticexyz/store/config/v2";

// this is only a default used for development
export const SEASON_PASS_NAMESPACE = "Season2";
const ORB_NAMESPACE = "Orb";
const SKY_KEY_NAMESPACE = "SkyKey";

const ERC20RegistryTableId = resourceToHex({ type: "table", namespace: "erc20-puppet", name: "ERC20Registry" });
const OrbBalancesTableId = resourceToHex({ type: "table", namespace: ORB_NAMESPACE, name: "Balances" });
const SkyKeyBalancesTableId = resourceToHex({ type: "table", namespace: SKY_KEY_NAMESPACE, name: "Balances" });
const UserDelegationControlTableId = resourceToHex({ type: "table", namespace: "", name: "UserDelegationControl" });
const SystemboundDelegationsTableId = resourceToHex({ type: "table", namespace: "", name: "SystemboundDelegations" });

export const syncFilters = (seasonPassNamespace: string): SyncFilter[] => [
  {
    tableId: ERC20RegistryTableId,
  },
  {
    tableId: OrbBalancesTableId,
  },
  {
    // generate tableId from SeasonPassNamespace table
    tableId: resourceToHex({ type: "table", namespace: seasonPassNamespace, name: "Balances" }),
  },
  {
    tableId: SkyKeyBalancesTableId,
  },
  {
    tableId: UserDelegationControlTableId,
  },
  {
    tableId: SystemboundDelegationsTableId,
  },
];

export const tables = (seasonPassNamespace: string) =>
  ({
    ERC20Registry: defineTable({
      namespace: "erc20-puppet",
      name: "ERC20Registry",
      label: "ERC20Registry",
      tableId: ERC20RegistryTableId,
      key: ["namespaceId"],
      schema: {
        namespaceId: "bytes32",
        erc20Address: "address",
      },
    }),
    Orb_Balances: defineTable({
      namespace: ORB_NAMESPACE,
      name: "Balances",
      label: "Orb_Balances",
      tableId: OrbBalancesTableId,
      key: ["account"],
      schema: {
        account: "address",
        value: "uint256",
      },
    }),
    SeasonPass_Balances: defineTable({
      namespace: SEASON_PASS_NAMESPACE,
      name: "Balances",
      label: "SeasonPass_Balances",
      tableId: resourceToHex({ type: "table", namespace: seasonPassNamespace, name: "Balances" }),
      key: ["account"],
      schema: {
        account: "address",
        value: "uint256",
      },
    }),
    SkyKey_Balances: defineTable({
      namespace: SKY_KEY_NAMESPACE,
      name: "Balances",
      label: "SkyKey_Balances",
      tableId: SkyKeyBalancesTableId,
      key: ["account"],
      schema: {
        account: "address",
        value: "uint256",
      },
    }),
    UserDelegationControl: defineTable({
      namespace: "",
      name: "UserDelegationCo",
      label: "UserDelegationControl",
      tableId: UserDelegationControlTableId,
      key: ["delegator", "delegatee"],
      schema: {
        delegator: "address",
        delegatee: "address",
        delegationControlId: "bytes32",
      },
    }),
    SystemboundDelegations: defineTable({
      namespace: "",
      name: "SystemboundDeleg",
      label: "SystemboundDelegations",
      tableId: SystemboundDelegationsTableId,
      key: ["delegator", "delegatee", "systemId"],
      schema: {
        delegator: "address",
        delegatee: "address",
        systemId: "bytes32",
        availableCalls: "uint256",
      },
    }),
  }) as const;
