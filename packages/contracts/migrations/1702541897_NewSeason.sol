// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

import { IERC721Mintable } from "@latticexyz/world-modules/src/modules/erc721-puppet/IERC721Mintable.sol";
import { registerERC721 } from "@latticexyz/world-modules/src/modules/erc721-puppet/registerERC721.sol";
import { ERC721MetadataData } from "@latticexyz/world-modules/src/modules/erc721-puppet/tables/ERC721Metadata.sol";

// table imports
import { SeasonTimes, SeasonPassConfig, SeasonPassLastSaleAt, SkyPoolConfig } from "../src/codegen/index.sol";

contract NewSeason is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    uint256 SEASON_START = 1704715200;
    vm.startBroadcast(deployerPrivateKey);

    // new season pass NFT
    IERC721Mintable seasonPass = registerERC721(
      world,
      "SeasonPass 0.1",
      ERC721MetadataData({ name: "Season Pass", symbol: unicode"🎫", baseURI: "" })
    );
    SkyPoolConfig.setSeasonPassToken(address(seasonPass));

    SeasonTimes.register();

    SeasonTimes.setSeasonStart(SEASON_START);
    SeasonTimes.setSeasonEnd(SEASON_START + 30 days);

    // pricing details
    SeasonPassConfig.setRate(86_806);
    SeasonPassConfig.setMinPrice(0.01 ether);
    SeasonPassConfig.setMultiplier(110);
    SeasonPassConfig.setStartingPrice(0.01 ether);
    SeasonPassConfig.setMintCutoff(SEASON_START + 3 days);
    SeasonPassLastSaleAt.set(SEASON_START);

    vm.stopBroadcast();
  }
}
