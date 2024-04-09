// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { BEFORE_CALL_SYSTEM } from "@latticexyz/world/src/systemHookTypes.sol";

import { IERC721Mintable } from "@latticexyz/world-modules/src/modules/erc721-puppet/IERC721Mintable.sol";
import { registerERC721 } from "@latticexyz/world-modules/src/modules/erc721-puppet/registerERC721.sol";
import { ERC721MetadataData } from "@latticexyz/world-modules/src/modules/erc721-puppet/tables/ERC721Metadata.sol";
import { _erc721SystemId } from "@latticexyz/world-modules/src/modules/erc721-puppet/utils.sol";

import { NoTransferHook } from "../src/NoTransferHook.sol";

// table imports
import { SkyPoolConfig, SeasonPassConfig, SeasonPassLastSaleAt } from "../src/codegen/index.sol";

contract ChangeDutchAuctionParams is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    // pricing details
    SeasonPassConfig.setRate(277_779);
    SeasonPassConfig.setMinPrice(0.005 ether);
    SeasonPassConfig.setMultiplier(110);
    SeasonPassConfig.setStartingPrice(0.005 ether);
    SeasonPassLastSaleAt.set(block.timestamp);

    IERC721Mintable seasonPassContract = registerERC721(
      world,
      "SeasonPass 2",
      ERC721MetadataData({ name: "Season Pass", symbol: unicode"🎫", baseURI: "" })
    );
    SkyPoolConfig.setSeasonPassToken(address(seasonPassContract));

    NoTransferHook hook = new NoTransferHook();
    world.registerSystemHook(_erc721SystemId("SeasonPass 2"), hook, BEFORE_CALL_SYSTEM);

    // Transfer season pass namespace to World
    ResourceId namespaceId = WorldResourceIdLib.encodeNamespace("SeasonPass 2");
    world.transferOwnership(namespaceId, worldAddress);

    vm.stopBroadcast();
  }
}
