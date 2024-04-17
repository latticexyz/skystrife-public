// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { SkyStrifeTest } from "./SkyStrifeTest.sol";

import { LibGold } from "../src/libraries/LibGold.sol";

import { Gold, Player, SpawnPoint, Charger, OwnedBy, LastAction, Chargee, CreatedByAddress } from "../src/codegen/index.sol";

import { addressToEntity } from "../src/libraries/LibUtils.sol";

import { createPlayerEntity, spawnPlayer } from "../src/libraries/LibPlayer.sol";

contract PlayerTest is SkyStrifeTest {
  bytes32 player;

  function testCreatePlayer() public {
    prankAdmin();
    player = createPlayerEntity(testMatch, alice);
    vm.stopPrank();

    assertEq(Player.get(testMatch, player), 1, "did not set Player table");
    assertEq(Gold.get(testMatch, player), 500, "did not set Gold table");
    assertEq(CreatedByAddress.get(testMatch, player), addressToEntity(alice), "did not set CreatedByAddress table");
  }

  function testSpawnPlayer() public {
    testCreatePlayer();

    bytes32 spawnPoint = keccak256("spawnPoint");

    prankAdmin();
    SpawnPoint.set(testMatch, spawnPoint, true);
    Charger.set(testMatch, spawnPoint, 1000);

    spawnPlayer(testMatch, player, spawnPoint);
    vm.stopPrank();

    assertEq(OwnedBy.get(testMatch, spawnPoint), player, "did not set OwnedBy table");
    assertEq(LastAction.get(testMatch, spawnPoint), block.timestamp, "did not set LastAction table");

    // test gold generation
    vm.warp(block.timestamp + 10 minutes);
    assertEq(LibGold.getCurrent(testMatch, player), 40500, "did not generate gold");
    assertEq(Chargee.get(testMatch, spawnPoint), player, "did not set Chargee table");
  }
}
