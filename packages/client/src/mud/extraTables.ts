import { resourceToHex } from "@latticexyz/common";
import { SyncFilter } from "@latticexyz/store-sync";

const SEASON_PASS_NAMESPACE = "Season1";
const ORB_NAMESPACE = "Orb";
const SKY_KEY_NAMESPACE = "SkyKey";

const ERC20RegistryTableId = resourceToHex({ type: "table", namespace: "erc20-puppet", name: "ERC20Registry" });
const OrbBalancesTableId = resourceToHex({ type: "table", namespace: ORB_NAMESPACE, name: "Balances" });
const SeasonPassBalancesTableId = resourceToHex({ type: "table", namespace: SEASON_PASS_NAMESPACE, name: "Balances" });
const SkyKeyBalancesTableId = resourceToHex({ type: "table", namespace: SKY_KEY_NAMESPACE, name: "Balances" });
const UserDelegationControlTableId = resourceToHex({ type: "table", namespace: "", name: "UserDelegationControl" });
const SystemboundDelegationsTableId = resourceToHex({ type: "table", namespace: "", name: "SystemboundDelegations" });

export const syncFilters: SyncFilter[] = [
  {
    tableId: ERC20RegistryTableId,
  },
  {
    tableId: OrbBalancesTableId,
  },
  {
    tableId: SeasonPassBalancesTableId,
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

export const tables = {
  ERC20Registry: {
    namespace: "erc20-puppet",
    name: "ERC20Registry",
    tableId: ERC20RegistryTableId,
    keySchema: {
      namespaceId: { type: "bytes32" },
    },
    valueSchema: {
      erc20Address: { type: "address" },
    },
  },
  Orb_Balances: {
    namespace: ORB_NAMESPACE,
    name: "Balances",
    tableId: OrbBalancesTableId,
    keySchema: {
      account: { type: "address" },
    },
    valueSchema: {
      value: { type: "uint256" },
    },
  },
  SeasonPass_Balances: {
    namespace: SEASON_PASS_NAMESPACE,
    name: "Balances",
    tableId: SeasonPassBalancesTableId,
    keySchema: {
      account: { type: "address" },
    },
    valueSchema: {
      value: { type: "uint256" },
    },
  },
  SkyKey_Balances: {
    namespace: SKY_KEY_NAMESPACE,
    name: "Balances",
    tableId: SkyKeyBalancesTableId,
    keySchema: {
      account: { type: "address" },
    },
    valueSchema: {
      value: { type: "uint256" },
    },
  },
  UserDelegationControl: {
    namespace: "",
    name: "UserDelegationControl",
    tableId: UserDelegationControlTableId,
    keySchema: {
      delegator: { type: "address" },
      delegatee: { type: "address" },
    },
    valueSchema: {
      delegationControlId: {
        type: "bytes32",
      },
    },
  },
  SystemboundDelegations: {
    namespace: "",
    name: "SystemboundDelegations",
    tableId: SystemboundDelegationsTableId,
    keySchema: {
      delegator: { type: "address" },
      delegatee: { type: "address" },
      systemId: { type: "bytes32" },
    },
    valueSchema: {
      availableCalls: {
        type: "uint256",
      },
    },
  },
} as const;
