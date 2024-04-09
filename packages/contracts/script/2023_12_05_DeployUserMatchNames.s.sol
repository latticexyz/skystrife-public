// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Script.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Systems } from "@latticexyz/world/src/codegen/index.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

import { MatchSystem } from "../src/systems/MatchSystem.sol";

import { MatchName } from "../src/codegen/index.sol";

contract DeployUserMatchNames is Script {
  function run() external {
    IWorld world = IWorld(0x7203e7ADfDF38519e1ff4f8Da7DCdC969371f377);
    StoreSwitch.setStoreAddress(0x7203e7ADfDF38519e1ff4f8Da7DCdC969371f377);

    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    vm.startBroadcast(deployerPrivateKey);
    MatchName.register();

    ResourceId matchSystemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "", "MatchSystem");
    (address addr, bool publicAccess) = Systems.get(matchSystemId);
    console.log("Found existing MatchSystem address: %s, public access: %s", addr, publicAccess);

    world.registerSystem(matchSystemId, new MatchSystem(), true);
    (addr, publicAccess) = Systems.get(matchSystemId);
    console.log("new MatchSystem address: %s, public access: %s", addr, publicAccess);

    // world.registerRootFunctionSelector(
    //   matchSystemId,
    //   "createMatch(string,bytes32,bytes32,bytes32)",
    //   MatchSystem.createMatch.selector
    // );

    // world.registerRootFunctionSelector(
    //   matchSystemId,
    //   "createMatchSkyKey(string,bytes32,bytes32,bytes32,bytes32,uint256,uint256[],uint256)",
    //   MatchSystem.createMatchSkyKey.selector
    // );

    // world.registerRootFunctionSelector(
    //   matchSystemId,
    //   "createMatchSeasonPass(string,bytes32,bytes32,bytes32,bytes32,uint256,uint256[])",
    //   MatchSystem.createMatchSeasonPass.selector
    // );

    vm.stopBroadcast();
  }
}
