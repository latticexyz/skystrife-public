// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { _erc20SystemId } from "@latticexyz/world-modules/src/modules/erc20-puppet/utils.sol";
import { Puppet } from "@latticexyz/world-modules/src/modules/puppet/Puppet.sol";

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { SkyPoolConfig } from "./codegen/index.sol";

// Transfer ERC20 tokens on behalf of msg.sender
function transferToken(address worldAddress, address to, uint256 value) {
  address token = SkyPoolConfig.getOrbToken();
  ResourceId systemId = Puppet(token).systemId();

  bytes memory callData = abi.encodeCall(IERC20.transfer, (to, value));

  (bool success, ) = worldAddress.delegatecall(abi.encodeCall(IBaseWorld(worldAddress).call, (systemId, callData)));

  require(success, "token transfer failed");
}
