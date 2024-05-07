// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { BEFORE_CALL_SYSTEM } from "@latticexyz/world/src/systemHookTypes.sol";

import { IERC721Mintable } from "@latticexyz/world-modules/src/modules/erc721-puppet/IERC721Mintable.sol";
import { registerERC721 } from "@latticexyz/world-modules/src/modules/erc721-puppet/registerERC721.sol";
import { ERC721MetadataData } from "@latticexyz/world-modules/src/modules/erc721-puppet/tables/ERC721Metadata.sol";
import { _erc721SystemId } from "@latticexyz/world-modules/src/modules/erc721-puppet/utils.sol";

import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { ResourceId, WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { SeasonTimes, Admin, SeasonPassConfig, SeasonPassLastSaleAt, SkyPoolConfig, VirtualLevelTemplates, HeroInRotation, HeroInSeasonPassRotation, MatchRewardPercentages } from "../src/codegen/index.sol";

import { SeasonPassOnlySystem } from "../src/systems/SeasonPassOnlySystem.sol";
import { NoTransferHook } from "../src/NoTransferHook.sol";

import { SEASON_START_TIME, SEASON_PASS_STARTING_PRICE, SEASON_PASS_MIN_PRICE, SEASON_PASS_PRICE_DECREASE_PER_SECOND, SEASON_PASS_PURCHASE_MULTIPLIER_PERCENT, SEASON_PASS_MINT_DURATION, SEASON_DURATION, COST_CREATE_MATCH, WINDOW, SKYPOOL_SUPPLY, SKY_KEY_TOKEN_ID, SEASON_PASS_NAMESPACE, ORB_NAMESPACE, SKY_KEY_NAMESPACE, SEASON_PASS_SYMBOL, SEASON_PASS_NAME } from "../constants.sol";

// table imports
import { MatchConfig } from "../src/codegen/index.sol";

contract DeploySeasonPass is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    IERC721Mintable seasonPass = registerERC721(
      world,
      SEASON_PASS_NAMESPACE,
      ERC721MetadataData({
        name: SEASON_PASS_NAME,
        symbol: SEASON_PASS_SYMBOL,
        baseURI: "https://skystrife-metadata.latticexyz.workers.dev/metadata/"
      })
    );
    SkyPoolConfig.setSeasonPassToken(address(seasonPass));

    ResourceId systemId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "MatchAccess",
      name: "SeasonPassOnly"
    });
    System systemContract = new SeasonPassOnlySystem();

    ResourceId namespaceId = WorldResourceIdLib.encodeNamespace("MatchAccess");
    world.registerNamespace(namespaceId);
    world.registerSystem(systemId, systemContract, true);

    NoTransferHook subscriber = new NoTransferHook();

    // Register the non-transferability hook
    world.registerSystemHook(_erc721SystemId(SEASON_PASS_NAMESPACE), subscriber, BEFORE_CALL_SYSTEM);

    // Transfer season pass namespace to World
    namespaceId = WorldResourceIdLib.encodeNamespace(SEASON_PASS_NAMESPACE);
    world.transferOwnership(namespaceId, worldAddress);

    SeasonPassConfig.set(
      SEASON_PASS_MIN_PRICE,
      SEASON_PASS_STARTING_PRICE,
      SEASON_PASS_PRICE_DECREASE_PER_SECOND,
      SEASON_PASS_PURCHASE_MULTIPLIER_PERCENT,
      block.timestamp + SEASON_PASS_MINT_DURATION
    );
    SeasonTimes.set(block.timestamp, block.timestamp + SEASON_DURATION);
    SeasonPassLastSaleAt.set(block.timestamp);

    vm.stopBroadcast();
  }
}
