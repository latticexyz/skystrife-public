// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";

import { _balancesTableId } from "@latticexyz/world-modules/src/modules/erc20-puppet/utils.sol";
import { Balances } from "@latticexyz/world-modules/src/modules/tokens/tables/Balances.sol";
import { Puppet } from "@latticexyz/world-modules/src/modules/puppet/Puppet.sol";

import { SkyPoolConfig } from "./codegen/index.sol";

using WorldResourceIdInstance for ResourceId;

function hasToken(address token, address account) view returns (bool) {
  ResourceId systemId = Puppet(token).systemId();
  ResourceId tableId = _balancesTableId(systemId.getNamespace());

  return Balances.get(tableId, account) > 0;
}

function hasSeasonPass(address account) view returns (bool) {
  return hasToken(SkyPoolConfig.getSeasonPassToken(), account);
}
