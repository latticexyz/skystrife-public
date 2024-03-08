// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { BaseTest } from "./BaseTest.sol";

import { LibStamina } from "../src/libraries/LibStamina.sol";

import { Stamina, Player, SpawnPoint, Charger, OwnedBy, LastAction, Chargee } from "../src/codegen/index.sol";

import { addressToEntity } from "../src/libraries/LibUtils.sol";

import { createPlayerEntity, spawnPlayer } from "../src/libraries/LibPlayer.sol";

contract PlayerTest is BaseTest {
  bytes32 player;

  function testCreatePlayer() public {
    prankAdmin();
    player = createPlayerEntity(testMatch, alice);
    vm.stopPrank();

    assertEq(Player.get(testMatch, player), 1, "did not set Player table");
    assertEq(Stamina.get(testMatch, player), 250, "did not set Stamina table");
    assertEq(OwnedBy.get(testMatch, player), addressToEntity(alice), "did not set OwnedBy table");
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
    assertEq(LibStamina.getCurrent(testMatch, player), 40250, "did not generate gold");

    assertEq(Chargee.get(testMatch, spawnPoint), player, "did not set Chargee table");
  }
}
