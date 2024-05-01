// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

import { IERC721Metadata } from "@latticexyz/world-modules/src/modules/erc721-puppet/IERC721Metadata.sol";
import { TokenURI } from "@latticexyz/world-modules/src/modules/erc721-puppet/tables/TokenURI.sol";
import { _tokenUriTableId } from "@latticexyz/world-modules/src/modules/erc721-puppet/utils.sol";

// table imports
import { SkyPoolConfig } from "../src/codegen/index.sol";

import "forge-std/console.sol";

contract ViewTokenUri is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    IERC721Metadata token = IERC721Metadata(SkyPoolConfig.getSeasonPassToken());
    console.log(token.tokenURI(0));

    vm.stopBroadcast();
  }
}
