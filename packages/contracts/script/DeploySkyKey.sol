// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { IERC721Mintable } from "@latticexyz/world-modules/src/modules/erc721-puppet/IERC721Mintable.sol";
import { registerERC721 } from "@latticexyz/world-modules/src/modules/erc721-puppet/registerERC721.sol";
import { ERC721MetadataData } from "@latticexyz/world-modules/src/modules/erc721-puppet/tables/ERC721Metadata.sol";

import { SKY_KEY_NAMESPACE, SKY_KEY_TOKEN_ID } from "../constants.sol";
import { SkyPoolConfig } from "../src/codegen/index.sol";

contract DeploySkyKey is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    address admin = vm.addr(deployerPrivateKey);
    vm.startBroadcast(deployerPrivateKey);

    IERC721Mintable skyKey = registerERC721(
      world,
      SKY_KEY_NAMESPACE,
      ERC721MetadataData({
        name: "Sky Key",
        symbol: unicode"🔑",
        baseURI: "https://skystrife-metadata.latticexyz.workers.dev/metadata/skykey/"
      })
    );
    skyKey.mint(admin, SKY_KEY_TOKEN_ID);
    SkyPoolConfig.setSkyKeyToken(address(skyKey));

    vm.stopBroadcast();
  }
}
