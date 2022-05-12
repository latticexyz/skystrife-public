// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { BaseTest } from "./BaseTest.sol";

import { LibStamina } from "../src/libraries/LibStamina.sol";

import { Stamina, LastAction, MatchConfig, MatchConfigData, Charger, ChargeCap, OwnedBy, MatchConfig } from "../src/codegen/index.sol";

import { createPlayerEntity } from "../src/libraries/LibPlayer.sol";
import { charge } from "../src/libraries/LibCharge.sol";

contract LibStaminaTest is BaseTest {
  bytes32 entity;

  function staminaSetup() public {
    entity = keccak256("entity");
    prankAdmin();
    bytes32 player = createPlayerEntity(testMatch, alice);
    OwnedBy.set(testMatch, entity, player);
    Stamina.set(testMatch, entity, 0);
    LastAction.set(testMatch, entity, block.number);
    vm.stopPrank();
  }

  function testAddStamina() public {
    staminaSetup();

    prankAdmin();
    assertEq(Stamina.get(testMatch, entity), 0, "stam not 0");

    LibStamina.addStamina(testMatch, entity, 1000);

    int32 currentStamina = LibStamina.getCurrent(testMatch, entity);
    assertEq(currentStamina, 1000, "stam not 1000");
    vm.stopPrank();
  }

  function testReduceStamina() public {
    staminaSetup();

    prankAdmin();
    assertEq(Stamina.get(testMatch, entity), 0, "stam not 0");

    LibStamina.addStamina(testMatch, entity, 1000);
    LibStamina.spendStamina(testMatch, entity, 500);

    int32 currentStamina = LibStamina.getCurrent(testMatch, entity);
    assertEq(currentStamina, 500, "stam not 500");
    vm.stopPrank();
  }

  function testStaminaRegen() public {
    staminaSetup();

    vm.warp(block.timestamp + 10 minutes);

    prankAdmin();
    assertEq(LibStamina.getCurrent(testMatch, entity), 0, "stam not full");
    vm.stopPrank();
  }

  function testStaminaWithLastAction0() public {
    staminaSetup();

    prankAdmin();
    LastAction.set(testMatch, entity, 0);

    vm.warp(block.timestamp + 10 minutes);

    assertEq(LibStamina.getCurrent(testMatch, entity), 0, "stam not full");
    vm.stopPrank();
  }

  function testFailNotEnoughStamina() public {
    staminaSetup();

    prankAdmin();
    LibStamina.spendStamina(testMatch, entity, 1_000);
    vm.stopPrank();
  }

  function testChargers() public {
    staminaSetup();

    prankAdmin();
    bytes32 charger = keccak256("charger");
    Charger.set(testMatch, charger, 100);
    ChargeCap.set(testMatch, charger, 100, 0);

    charge(testMatch, charger, entity);

    vm.warp(block.timestamp + 30 seconds); // 2 turns

    // test that addStamina does not break chargers
    // there was a bug where addStamina using addStamina would wipe
    // charger stamina regen when capturing a mine
    LibStamina.addStamina(testMatch, entity, 0);

    // Charger only recharged 1 turn
    assertEq(LibStamina.getCurrent(testMatch, entity), 100, "unexpected stamina");

    vm.stopPrank();
  }
}
