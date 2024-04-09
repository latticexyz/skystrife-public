// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

import { ArcherTemplate, DragoonTemplate, GoldMineTemplate, HalberdierTemplate, KnightTemplate, PikemanTemplate, PillagerTemplate, SettlementTemplate, SwordsmanTemplate, SpawnSettlementTemplate, MarksmanTemplate } from "../src/codegen/Templates.sol";

contract SeasonZeroPointTwoBalanceChanges is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    ArcherTemplate();
    DragoonTemplate();
    GoldMineTemplate();
    HalberdierTemplate();
    KnightTemplate();
    PikemanTemplate();
    PillagerTemplate();
    SettlementTemplate();
    SwordsmanTemplate();
    SpawnSettlementTemplate();
    MarksmanTemplate();

    vm.stopBroadcast();
  }
}
