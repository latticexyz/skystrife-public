// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

// table imports
import { MatchConfig, PracticeMatch } from "../src/codegen/index.sol";

import { MatchSystem } from "../src/systems/MatchSystem.sol";
import { CancelMatchSystem } from "../src/systems/CancelMatchSystem.sol";

import { redeploySystem } from "./migrationUtils.sol";

contract DeployEntranceFeeLimits is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    PracticeMatch.register();

    ResourceId systemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "", "MatchSystem");
    world.registerRootFunctionSelector(
      systemId,
      "createMatchSeasonPass(string,bytes32,bytes32,bytes32,bytes32,uint256,uint256[],bool)",
      "createMatchSeasonPass(string,bytes32,bytes32,bytes32,bytes32,uint256,uint256[],bool)"
    );
    world.registerRootFunctionSelector(
      systemId,
      "createMatchSkyKey(string,bytes32,bytes32,bytes32,bytes32,uint256,uint256[],uint256,bool)",
      "createMatchSkyKey(string,bytes32,bytes32,bytes32,bytes32,uint256,uint256[],uint256,bool)"
    );
    world.registerRootFunctionSelector(
      systemId,
      "createMatch(string,bytes32,bytes32,bytes32,bool)",
      "createMatch(string,bytes32,bytes32,bytes32,bool)"
    );

    redeploySystem(world, new MatchSystem(), "MatchSystem");
    redeploySystem(world, new CancelMatchSystem(), "CancelMatchSyste");

    vm.stopBroadcast();
  }
}
