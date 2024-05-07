// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { IERC20Mintable } from "@latticexyz/world-modules/src/modules/erc20-puppet/IERC20Mintable.sol";
import { registerERC20 } from "@latticexyz/world-modules/src/modules/erc20-puppet/registerERC20.sol";
import { ERC20MetadataData } from "@latticexyz/world-modules/src/modules/erc20-puppet/tables/ERC20Metadata.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";

import { SKYPOOL_SUPPLY, ORB_NAMESPACE } from "../constants.sol";

// table imports
import { SkyPoolConfig } from "../src/codegen/index.sol";

contract DeployOrbs is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    IERC20Mintable orbToken = registerERC20(
      world,
      ORB_NAMESPACE,
      ERC20MetadataData({ decimals: 18, name: "Orbs", symbol: unicode"🔮" })
    );
    orbToken.mint(worldAddress, SKYPOOL_SUPPLY);
    SkyPoolConfig.setOrbToken(address(orbToken));

    vm.stopBroadcast();
  }
}
