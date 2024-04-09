// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { SkyStrifeTest } from "./SkyStrifeTest.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { Name } from "../src/codegen/index.sol";

import { addressToEntity } from "../src/libraries/LibUtils.sol";

contract NameSystemTest is SkyStrifeTest, GasReporter {
  string chosenName;

  function runSystem() public prank(alice) {
    world.setName(chosenName);
  }

  function testSetName() public {
    chosenName = "alice";

    startGasReport("Set Name");
    runSystem();
    endGasReport();
    assertEq(Name.get(addressToEntity(alice)), "alice");
  }

  function testCannotContainWhitespace() public {
    chosenName = "test name";
    vm.expectRevert("name is invalid");
    runSystem();
  }

  function testCannotContainWeirdWhitespace() public {
    chosenName = "test\rname";
    vm.expectRevert("name is invalid");
    runSystem();
  }

  function testCannotBeMoreThan32Chars() public {
    chosenName = "this name is too long and will not be accepted";
    vm.expectRevert("name is invalid");
    runSystem();
  }

  function testCannotBeEmpty() public {
    chosenName = "";
    vm.expectRevert("name is invalid");
    runSystem();
  }

  function testCannotBeNonAscii() public {
    chosenName = unicode"🔮";
    vm.expectRevert("name is invalid");
    runSystem();
  }
}
