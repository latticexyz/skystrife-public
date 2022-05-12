// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { BaseTest } from "./BaseTest.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";

import { Puppet } from "@latticexyz/world-modules/src/modules/puppet/Puppet.sol";
import { IERC20Mintable } from "@latticexyz/world-modules/src/modules/erc20-puppet/IERC20Mintable.sol";
import { registerERC20 } from "@latticexyz/world-modules/src/modules/erc20-puppet/registerERC20.sol";
import { _balancesTableId } from "@latticexyz/world-modules/src/modules/erc20-puppet/utils.sol";
import { ERC20MetadataData } from "@latticexyz/world-modules/src/modules/erc20-puppet/tables/ERC20Metadata.sol";
import { Balances } from "@latticexyz/world-modules/src/modules/tokens/tables/Balances.sol";

contract TokenTest is BaseTest {
  using WorldResourceIdInstance for ResourceId;

  function testToken() public {
    // Register a new ERC20 token
    IERC20Mintable token = registerERC20(
      world,
      "myERC20",
      ERC20MetadataData({ decimals: 18, name: "Token", symbol: "TKN" })
    );

    ResourceId systemId = Puppet(address(token)).systemId();

    token.mint(alice, 100);

    vm.prank(alice);
    token.transfer(bob, 75);

    // assert that the balances are what we expect
    assertEq(token.balanceOf(alice), 25);
    assertEq(Balances.get(_balancesTableId(systemId.getNamespace()), alice), 25);

    assertEq(token.balanceOf(bob), 75);
    assertEq(Balances.get(_balancesTableId(systemId.getNamespace()), bob), 75);
  }
}
