// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

import { ArcherTemplate, DragonTemplate, GoldMineTemplate, GolemTemplate, KnightTemplate, PikemanTemplate, RiderTemplate, SettlementTemplate, SwordsmanTemplate, SpawnSettlementTemplate, WizardTemplate } from "../src/codegen/Templates.sol";

contract SeasonZeroPointTwoBalanceChanges is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    ArcherTemplate();
    DragonTemplate();
    GoldMineTemplate();
    GolemTemplate();
    KnightTemplate();
    PikemanTemplate();
    RiderTemplate();
    SettlementTemplate();
    SwordsmanTemplate();
    SpawnSettlementTemplate();
    WizardTemplate();

    vm.stopBroadcast();
  }
}
