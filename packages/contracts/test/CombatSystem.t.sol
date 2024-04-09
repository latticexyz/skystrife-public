// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { SkyStrifeTest } from "./SkyStrifeTest.sol";

import { LibCombat } from "../src/libraries/LibCombat.sol";
import { LibGold } from "../src/libraries/LibGold.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { Combat, CombatData, Charger, PositionData, OwnedBy, Capturable, StructureType, GoldOnKill, MatchConfig, Chargers, RequiresSetup, CombatOutcomeData, ArchetypeModifier } from "../src/codegen/index.sol";

import { StructureTypes, CombatArchetypes } from "../src/codegen/common.sol";

import { createPlayerEntity } from "../src/libraries/LibPlayer.sol";
import { setPosition } from "../src/libraries/LibPosition.sol";
import { spawnTemplateAt } from "../src/libraries/LibTemplate.sol";

import { LibCombatOutcome } from "base/libraries/LibCombatOutcome.sol";

contract CombatSystemTest is SkyStrifeTest, GasReporter {
  bytes32 player;
  bytes32 defenderPlayer;
  bytes32 attacker;
  bytes32 defender;

  function createUnit(bytes32 entity, bytes32 owner, PositionData memory position) private {
    Combat.set(
      testMatch,
      entity,
      CombatData({
        health: 100_000,
        maxHealth: 100_000,
        strength: 20_000,
        counterStrength: 0,
        minRange: 1,
        maxRange: 1,
        archetype: CombatArchetypes.Unknown
      })
    );
    setPosition(testMatch, entity, position);
    OwnedBy.set(testMatch, entity, owner);

    // Pass time beyond units last actions timestamps
    vm.warp(block.timestamp + 100);
  }

  function combatSetup() public {
    attacker = keccak256("attacker");
    defender = keccak256("defender");

    prankAdmin();
    player = createPlayerEntity(testMatch, alice);
    defenderPlayer = createPlayerEntity(testMatch, bob);

    createUnit(attacker, player, PositionData({ x: 0, y: 0 }));
    createUnit(defender, defenderPlayer, PositionData({ x: 0, y: 1 }));
    vm.stopPrank();
  }

  function runSystem() public prank(alice) {
    world.fight(testMatch, attacker, defender);
  }

  function testCombat(int32 attackerHealth, int32 defenderHealth, int32 attackerArmor, int32 defenderArmor) public {
    vm.assume(attackerHealth > 50_000);
    vm.assume(defenderHealth > 50_000);
    attackerArmor = int32(bound(attackerArmor, 0, 10_000_000));
    defenderArmor = int32(bound(defenderArmor, 0, 10_000_000));

    combatSetup();

    prankAdmin();
    Combat.setHealth(testMatch, attacker, attackerHealth);
    Combat.setHealth(testMatch, defender, defenderHealth);
    vm.stopPrank();

    startGasReport("Attack unit");
    runSystem();
    endGasReport();

    int32 attackerDamage = LibCombat.calculateDamageAttacker(testMatch, attacker, defender);
    int32 defenderDamage = LibCombat.calculateDamageDefender(testMatch, attacker, defender);

    assertEq(Combat.getHealth(testMatch, attacker), attackerHealth - defenderDamage, "unexpected attacker HP");
    assertEq(Combat.getHealth(testMatch, defender), defenderHealth - attackerDamage, "unexpected defender HP");
  }

  function testKilling() public {
    combatSetup();

    prankAdmin();
    Combat.setHealth(testMatch, defender, 1);
    vm.stopPrank();

    startGasReport("Attack unit and killing");
    runSystem();
    endGasReport();

    assertEq(Combat.getHealth(testMatch, defender), 0, "unexpected defender HP");
    assertEq(OwnedBy.get(testMatch, defender), 0, "unexpected defender owner");
  }

  function testCapturing() public {
    combatSetup();

    prankAdmin();
    Combat.setHealth(testMatch, defender, 1_000);
    Capturable.set(testMatch, defender, true);
    vm.stopPrank();

    startGasReport("Attack unit and capturing");
    runSystem();
    endGasReport();

    // defender has max hp
    assertEq(Combat.getHealth(testMatch, defender), 100_000, "unexpected defender HP");
    // ownership changes
    assertEq(OwnedBy.get(testMatch, defender), player, "unexpected defender owner");
  }

  function testCapturingCharger() public {
    combatSetup();

    prankAdmin();

    Combat.setHealth(testMatch, defender, 1_000);
    Capturable.set(testMatch, defender, true);
    Charger.set(testMatch, defender, 500);
    vm.stopPrank();

    startGasReport("Attack unit and capturing a charger");
    runSystem();
    endGasReport();
  }

  function testCapturingStructure() public {
    combatSetup();

    prankAdmin();
    Combat.setStrength(testMatch, attacker, 100_000);

    Combat.setHealth(testMatch, defender, 160_000);
    Capturable.set(testMatch, defender, true);
    StructureType.set(testMatch, defender, StructureTypes.Settlement);
    Combat.setCounterStrength(testMatch, defender, 0);
    vm.stopPrank();

    runSystem();

    vm.warp(block.timestamp + 100);

    // Uses structureStrength against capturable entities
    assertEq(Combat.getHealth(testMatch, defender), 60_000, "unexpected defender HP");

    vm.warp(block.timestamp + 100);
    runSystem();

    // Changes owner and sets max hp when captured
    assertEq(OwnedBy.get(testMatch, defender), player, "unexpected defender owner");
    assertEq(Combat.getHealth(testMatch, defender), Combat.getMaxHealth(testMatch, defender), "unexpected defender HP");
  }

  function testCannotAttackUnitWithSameOwner() public {
    combatSetup();

    prankAdmin();
    OwnedBy.set(testMatch, defender, player);
    vm.stopPrank();

    vm.expectRevert("cannot attack own entity");
    runSystem();
  }

  function testGoldOnKill() public {
    combatSetup();

    prankAdmin();
    GoldOnKill.set(testMatch, defender, 100);
    Combat.setHealth(testMatch, defender, 1);
    vm.stopPrank();

    int32 originalGold = LibGold.getCurrent(testMatch, player);
    runSystem();

    assertEq(LibGold.getCurrent(testMatch, player), originalGold + 100, "attacking player did not gain gold");
  }

  function testGoldOnKillWhenUnitsKillEachOther() public {
    combatSetup();

    prankAdmin();
    GoldOnKill.set(testMatch, defender, 100);
    Combat.setHealth(testMatch, defender, 1);
    GoldOnKill.set(testMatch, attacker, 100);
    Combat.setHealth(testMatch, attacker, 1);
    vm.stopPrank();

    int32 originalGold = LibGold.getCurrent(testMatch, player);
    int32 originalDefenderGold = LibGold.getCurrent(testMatch, defenderPlayer);
    runSystem();

    assertEq(Combat.getHealth(testMatch, attacker), 0, "attacker did not die");
    assertEq(Combat.getHealth(testMatch, defender), 0, "defender did not die");

    assertEq(LibGold.getCurrent(testMatch, player), originalGold + 100, "attacking player did not gain gold");
    assertEq(
      LibGold.getCurrent(testMatch, defenderPlayer),
      originalDefenderGold + 100,
      "defending player did not gain gold"
    );
  }

  function testGoldMines() public {
    combatSetup();

    prankAdmin();
    // Spawn a neutral mine
    bytes32 goldMine = spawnTemplateAt(testMatch, "GoldMine", 0, PositionData({ x: 1, y: 0 }));

    // so we can one-shot mines
    Combat.setStrength(testMatch, attacker, 300_000);
    Combat.setStrength(testMatch, defender, 300_000);
    vm.stopPrank();

    int32 originalGold = LibGold.getCurrent(testMatch, player);

    vm.startPrank(alice);
    world.fight(testMatch, attacker, goldMine);
    vm.stopPrank();

    // check alice owns mine
    assertEq(OwnedBy.get(testMatch, goldMine), player, "unexpected mine owner");

    // two turns elapsed
    vm.warp(block.timestamp + MatchConfig.get(testMatch).turnLength * 2);

    assertEq(Chargers.length(testMatch, player), 1, "unexpected charger count");

    // check alice has gained gold
    prankAdmin();
    assertEq(
      LibGold.getCurrent(testMatch, player),
      originalGold + Charger.get(testMatch, goldMine) * 2,
      "unexpected gold gain"
    );
    vm.stopPrank();
  }

  function testRequiresSetupCannotMoveAndAttack() public {
    combatSetup();

    prankAdmin();
    RequiresSetup.set(testMatch, attacker, true);
    vm.stopPrank();

    vm.expectRevert("cannot move and attack");
    world.moveAndAttack(testMatch, attacker, new PositionData[](0), defender);
  }

  function testCombatOutcomeSystemIsInternal() public {
    vm.startPrank(alice);
    vm.expectRevert();
    LibCombatOutcome.setCombatOutcome(
      0,
      CombatOutcomeData({
        attacker: attacker,
        defender: defender,
        attackerDamageReceived: 0,
        defenderDamageReceived: 0,
        attackerDamage: 0,
        defenderDamage: 0,
        ranged: false,
        attackerDied: false,
        defenderDied: false,
        defenderCaptured: false,
        blockNumber: 0,
        timestamp: 0
      })
    );
    vm.stopPrank();
  }

  function testArchetypeModifier() public {
    combatSetup();

    prankAdmin();
    Combat.setArchetype(testMatch, attacker, CombatArchetypes.Swordsman);
    Combat.setArchetype(testMatch, defender, CombatArchetypes.Pikeman);

    ArchetypeModifier.setMod(CombatArchetypes.Swordsman, CombatArchetypes.Pikeman, 30); // 30% damage increase
    ArchetypeModifier.setMod(CombatArchetypes.Pikeman, CombatArchetypes.Swordsman, -30); // 30% damage decrease
    vm.stopPrank();

    int32 originalDefenderHealth = Combat.getHealth(testMatch, defender);
    int32 originalAttackerHealth = Combat.getHealth(testMatch, attacker);
    runSystem();

    assertEq(Combat.getHealth(testMatch, defender), originalDefenderHealth - 26_000, "unexpected defender HP");
    assertEq(Combat.getHealth(testMatch, attacker), originalAttackerHealth - 14_000, "unexpected attacker HP");
  }
}
