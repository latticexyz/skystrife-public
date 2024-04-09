// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { SkyStrifeTest } from "./SkyStrifeTest.sol";

import { LibGold } from "../src/libraries/LibGold.sol";

import { Gold, LastAction, Charger, ChargeCap, OwnedBy } from "../src/codegen/index.sol";

import { createPlayerEntity } from "../src/libraries/LibPlayer.sol";
import { charge } from "../src/libraries/LibCharge.sol";

contract LibGoldTest is SkyStrifeTest {
  bytes32 entity;

  function goldSetup() public {
    entity = keccak256("entity");
    prankAdmin();
    bytes32 player = createPlayerEntity(testMatch, alice);
    OwnedBy.set(testMatch, entity, player);
    Gold.set(testMatch, entity, 0);
    LastAction.set(testMatch, entity, block.number);
    vm.stopPrank();
  }

  function testAddGold() public {
    goldSetup();

    prankAdmin();
    assertEq(Gold.get(testMatch, entity), 0, "stam not 0");

    LibGold.addGold(testMatch, entity, 1000);

    int32 currentGold = LibGold.getCurrent(testMatch, entity);
    assertEq(currentGold, 1000, "stam not 1000");
    vm.stopPrank();
  }

  function testReduceGold() public {
    goldSetup();

    prankAdmin();
    assertEq(Gold.get(testMatch, entity), 0, "stam not 0");

    LibGold.addGold(testMatch, entity, 1000);
    LibGold.spendGold(testMatch, entity, 500);

    int32 currentGold = LibGold.getCurrent(testMatch, entity);
    assertEq(currentGold, 500, "stam not 500");
    vm.stopPrank();
  }

  function testGoldRegen() public {
    goldSetup();

    vm.warp(block.timestamp + 10 minutes);

    prankAdmin();
    assertEq(LibGold.getCurrent(testMatch, entity), 0, "stam not full");
    vm.stopPrank();
  }

  function testGoldWithLastAction0() public {
    goldSetup();

    prankAdmin();
    LastAction.set(testMatch, entity, 0);

    vm.warp(block.timestamp + 10 minutes);

    assertEq(LibGold.getCurrent(testMatch, entity), 0, "stam not full");
    vm.stopPrank();
  }

  function testFailNotEnoughGold() public {
    goldSetup();

    prankAdmin();
    LibGold.spendGold(testMatch, entity, 1_000);
    vm.stopPrank();
  }

  function testChargers() public {
    goldSetup();

    prankAdmin();
    bytes32 charger = keccak256("charger");
    Charger.set(testMatch, charger, 100);
    ChargeCap.set(testMatch, charger, 100, 0);

    charge(testMatch, charger, entity);

    vm.warp(block.timestamp + 30 seconds); // 2 turns

    // test that addGold does not break chargers
    // there was a bug where addGold using addGold would wipe
    // charger gold regen when capturing a mine
    LibGold.addGold(testMatch, entity, 0);

    // Charger only recharged 1 turn
    assertEq(LibGold.getCurrent(testMatch, entity), 100, "unexpected gold");

    vm.stopPrank();
  }
}
