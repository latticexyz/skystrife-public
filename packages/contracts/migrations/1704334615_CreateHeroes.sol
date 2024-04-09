// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

// table imports
import { HeroInRotation, HeroInSeasonPassRotation } from "../src/codegen/index.sol";
import { HalberdierTemplateId, DragoonTemplateId, MarksmanTemplateId, HalberdierTemplate, DragoonTemplate, MarksmanTemplate } from "../src/codegen/Templates.sol";

contract CreateHeroes is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    HalberdierTemplate();
    DragoonTemplate();
    MarksmanTemplate();

    HeroInRotation.set(HalberdierTemplateId, true);
    HeroInSeasonPassRotation.set(DragoonTemplateId, true);
    HeroInSeasonPassRotation.set(MarksmanTemplateId, true);

    vm.stopBroadcast();
  }
}
