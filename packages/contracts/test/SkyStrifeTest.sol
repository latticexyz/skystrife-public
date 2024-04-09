// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";

import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { ROOT_NAMESPACE, ROOT_NAMESPACE_ID } from "@latticexyz/world/src/constants.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";

import { getMatch, addressToEntity } from "../src/libraries/LibUtils.sol";
import { getStartTimeOfWindow } from "../src/libraries/LibSkyPool.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { LevelInStandardRotation, MatchConfig, SkyPoolConfig, MatchReady, LastMatchIndex, MatchSky } from "../src/codegen/index.sol";

// ONLY FOR TESTING
// incredibly expensive to run because it needs to loop through all existing matches
function findFirstMatchAtOrAfterTime(uint256 timestamp) view returns (bytes32) {
  bytes32 foundMatch;
  uint32 matchIndex = 1;

  while (foundMatch == 0) {
    bytes32 matchEntity = getMatch(matchIndex);
    if (matchEntity == 0) {
      break;
    }

    if (MatchSky.getCreatedAt(matchEntity) >= timestamp) {
      foundMatch = matchEntity;
    }
    matchIndex++;
  }

  return foundMatch;
}

function findFirstMatchInWindow() view returns (bytes32) {
  uint256 startTimeOfWindow = getStartTimeOfWindow(SkyPoolConfig.getWindow());
  return findFirstMatchAtOrAfterTime(startTimeOfWindow);
}

function createPublicMatch(IWorld world, bytes32 levelId) returns (bytes32 matchEntity) {
  // generate arbitrary match ID
  matchEntity = bytes32(uint256(LastMatchIndex.get() + 1));
  uint256 startTimeOfWindow = getStartTimeOfWindow(SkyPoolConfig.getWindow());
  bytes32 firstMatchInWindow = findFirstMatchAtOrAfterTime(startTimeOfWindow);
  if (firstMatchInWindow == 0) {
    firstMatchInWindow = matchEntity;
  }

  world.createMatch("match", firstMatchInWindow, matchEntity, levelId);

  return matchEntity;
}

contract SkyStrifeTest is MudTest {
  IWorld world;
  uint256 userNonce = 0;

  address payable alice;
  address payable bob;
  address payable eve;

  bytes32 testMatch;

  function setUp() public override {
    super.setUp();
    world = IWorld(worldAddress);

    bytes32 levelId = "debug";

    prankAdmin();
    SkyPoolConfig.setCost(0); // make matches free to create in tests
    world.setRotationStandard(levelId, true); // add the level to the rotation
    testMatch = createPublicMatch(world, levelId);
    while (MatchReady.get(testMatch) == 0) {
      world.copyMap(testMatch);
    }
    MatchConfig.setStartTime(testMatch, block.timestamp);
    vm.stopPrank();

    alice = getUser();
    bob = getUser();
    eve = getUser();
  }

  function getUser() internal returns (address payable) {
    address payable user = payable(address(uint160(uint256(keccak256(abi.encodePacked(userNonce++))))));
    vm.deal(user, 100 ether);
    return user;
  }

  modifier prank(address target) {
    vm.startPrank(target);
    _;
    vm.stopPrank();
  }

  modifier adminPrank() {
    vm.startPrank(NamespaceOwner.get(ROOT_NAMESPACE_ID));
    _;
    vm.stopPrank();
  }

  function prankAdmin() internal {
    vm.startPrank(NamespaceOwner.get(ROOT_NAMESPACE_ID));
  }
}
