// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "@latticexyz/world/src/System.sol";
import { IWorld } from "../codegen/world/IWorld.sol";

import { ArchetypeModifier, ArchetypeModifierData } from "../codegen/index.sol";

import { CombatArchetypes } from "../codegen/common.sol";

//
// S W O R D S M A N   M O D I F I E R S
function createSwordsmanModifiers() {
  // Swordsman vs. Pikeman
  ArchetypeModifier.set(
    CombatArchetypes.Swordsman,
    CombatArchetypes.Pikeman,
    ArchetypeModifierData({
      mod: 50,
      attackerArchetype: CombatArchetypes.Swordsman,
      defenderArchetype: CombatArchetypes.Pikeman
    })
  );

  // Swordsman vs. Golem
  ArchetypeModifier.set(
    CombatArchetypes.Swordsman,
    CombatArchetypes.Golem,
    ArchetypeModifierData({
      mod: 50,
      attackerArchetype: CombatArchetypes.Swordsman,
      defenderArchetype: CombatArchetypes.Golem
    })
  );

  // Swordsman vs. Brute
  ArchetypeModifier.set(
    CombatArchetypes.Swordsman,
    CombatArchetypes.Brute,
    ArchetypeModifierData({
      mod: -50,
      attackerArchetype: CombatArchetypes.Swordsman,
      defenderArchetype: CombatArchetypes.Brute
    })
  );

  // Swordsman vs. Rider
  ArchetypeModifier.set(
    CombatArchetypes.Swordsman,
    CombatArchetypes.Rider,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Swordsman,
      defenderArchetype: CombatArchetypes.Rider
    })
  );

  // Swordsman vs. Knight
  ArchetypeModifier.set(
    CombatArchetypes.Swordsman,
    CombatArchetypes.Knight,
    ArchetypeModifierData({
      mod: -0,
      attackerArchetype: CombatArchetypes.Swordsman,
      defenderArchetype: CombatArchetypes.Knight
    })
  );

  // Swordsman vs. Dragon
  ArchetypeModifier.set(
    CombatArchetypes.Swordsman,
    CombatArchetypes.Dragon,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Swordsman,
      defenderArchetype: CombatArchetypes.Dragon
    })
  );

  // Swordsman vs. Archer
  ArchetypeModifier.set(
    CombatArchetypes.Swordsman,
    CombatArchetypes.Archer,
    ArchetypeModifierData({
      mod: 25,
      attackerArchetype: CombatArchetypes.Swordsman,
      defenderArchetype: CombatArchetypes.Archer
    })
  );

  // Swordsman vs. Catapult
  ArchetypeModifier.set(
    CombatArchetypes.Swordsman,
    CombatArchetypes.Catapult,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Swordsman,
      defenderArchetype: CombatArchetypes.Catapult
    })
  );

  // Swordsman vs. Wizard
  ArchetypeModifier.set(
    CombatArchetypes.Swordsman,
    CombatArchetypes.Wizard,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Swordsman,
      defenderArchetype: CombatArchetypes.Wizard
    })
  );

  // Swordsman vs. Settlement
  ArchetypeModifier.set(
    CombatArchetypes.Swordsman,
    CombatArchetypes.Settlement,
    ArchetypeModifierData({
      mod: 50,
      attackerArchetype: CombatArchetypes.Swordsman,
      defenderArchetype: CombatArchetypes.Settlement
    })
  );

  // Swordsman vs. SpawnSettlement
  ArchetypeModifier.set(
    CombatArchetypes.Swordsman,
    CombatArchetypes.SpawnSettlement,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Swordsman,
      defenderArchetype: CombatArchetypes.SpawnSettlement
    })
  );

  // Swordsman vs. GoldMine
  ArchetypeModifier.set(
    CombatArchetypes.Swordsman,
    CombatArchetypes.GoldMine,
    ArchetypeModifierData({
      mod: 50,
      attackerArchetype: CombatArchetypes.Swordsman,
      defenderArchetype: CombatArchetypes.GoldMine
    })
  );
}

//
// P I K E M A N   M O D I F I E R S
function createPikemanModifiers() {
  // Pikeman vs. Swordsman
  ArchetypeModifier.set(
    CombatArchetypes.Pikeman,
    CombatArchetypes.Swordsman,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Pikeman,
      defenderArchetype: CombatArchetypes.Swordsman
    })
  );
  // Pikeman vs. Brute
  ArchetypeModifier.set(
    CombatArchetypes.Pikeman,
    CombatArchetypes.Brute,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Pikeman,
      defenderArchetype: CombatArchetypes.Brute
    })
  );
  // Pikeman vs. Rider
  ArchetypeModifier.set(
    CombatArchetypes.Pikeman,
    CombatArchetypes.Rider,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Pikeman,
      defenderArchetype: CombatArchetypes.Rider
    })
  );
  // Pikeman vs. Knight
  ArchetypeModifier.set(
    CombatArchetypes.Pikeman,
    CombatArchetypes.Knight,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Pikeman,
      defenderArchetype: CombatArchetypes.Knight
    })
  );
  // Pikeman vs. Dragon
  ArchetypeModifier.set(
    CombatArchetypes.Pikeman,
    CombatArchetypes.Dragon,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Pikeman,
      defenderArchetype: CombatArchetypes.Dragon
    })
  );
  // Pikeman vs. Archer
  ArchetypeModifier.set(
    CombatArchetypes.Pikeman,
    CombatArchetypes.Archer,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Pikeman,
      defenderArchetype: CombatArchetypes.Archer
    })
  );
  // Pikeman vs. Catapult
  ArchetypeModifier.set(
    CombatArchetypes.Pikeman,
    CombatArchetypes.Catapult,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Pikeman,
      defenderArchetype: CombatArchetypes.Catapult
    })
  );
  // Pikeman vs. Wizard
  ArchetypeModifier.set(
    CombatArchetypes.Pikeman,
    CombatArchetypes.Wizard,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Pikeman,
      defenderArchetype: CombatArchetypes.Wizard
    })
  );
  // Pikeman vs. Settlement
  ArchetypeModifier.set(
    CombatArchetypes.Pikeman,
    CombatArchetypes.Settlement,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Pikeman,
      defenderArchetype: CombatArchetypes.Settlement
    })
  );
  // Pikeman vs. SpawnSettlement
  ArchetypeModifier.set(
    CombatArchetypes.Pikeman,
    CombatArchetypes.SpawnSettlement,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Pikeman,
      defenderArchetype: CombatArchetypes.SpawnSettlement
    })
  );
  // Pikeman vs. GoldMine
  ArchetypeModifier.set(
    CombatArchetypes.Pikeman,
    CombatArchetypes.GoldMine,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Pikeman,
      defenderArchetype: CombatArchetypes.GoldMine
    })
  );
}

// G O L E M   M O D I F I E R S
function createGolemModifiers() {
  // Golem vs. Swordsman
  ArchetypeModifier.set(
    CombatArchetypes.Golem,
    CombatArchetypes.Swordsman,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Golem,
      defenderArchetype: CombatArchetypes.Swordsman
    })
  );

  // Golem vs. Brute
  ArchetypeModifier.set(
    CombatArchetypes.Golem,
    CombatArchetypes.Brute,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Golem,
      defenderArchetype: CombatArchetypes.Brute
    })
  );

  // Golem vs. Rider
  ArchetypeModifier.set(
    CombatArchetypes.Golem,
    CombatArchetypes.Rider,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Golem,
      defenderArchetype: CombatArchetypes.Rider
    })
  );
  // Golem vs. Knight
  ArchetypeModifier.set(
    CombatArchetypes.Golem,
    CombatArchetypes.Knight,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Golem,
      defenderArchetype: CombatArchetypes.Knight
    })
  );
  // Golem vs. Dragon
  ArchetypeModifier.set(
    CombatArchetypes.Golem,
    CombatArchetypes.Dragon,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Golem,
      defenderArchetype: CombatArchetypes.Dragon
    })
  );
  // Golem vs. Archer
  ArchetypeModifier.set(
    CombatArchetypes.Golem,
    CombatArchetypes.Archer,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Golem,
      defenderArchetype: CombatArchetypes.Archer
    })
  );
  // Golem vs. Catapult
  ArchetypeModifier.set(
    CombatArchetypes.Golem,
    CombatArchetypes.Catapult,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Golem,
      defenderArchetype: CombatArchetypes.Catapult
    })
  );
  // Golem vs. Wizard
  ArchetypeModifier.set(
    CombatArchetypes.Golem,
    CombatArchetypes.Wizard,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Golem,
      defenderArchetype: CombatArchetypes.Wizard
    })
  );
  // Golem vs. Settlement
  ArchetypeModifier.set(
    CombatArchetypes.Golem,
    CombatArchetypes.Settlement,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Golem,
      defenderArchetype: CombatArchetypes.Settlement
    })
  );
  // Golem vs. SpawnSettlement
  ArchetypeModifier.set(
    CombatArchetypes.Golem,
    CombatArchetypes.SpawnSettlement,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Golem,
      defenderArchetype: CombatArchetypes.SpawnSettlement
    })
  );
  // Golem vs. GoldMine
  ArchetypeModifier.set(
    CombatArchetypes.Golem,
    CombatArchetypes.GoldMine,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Golem,
      defenderArchetype: CombatArchetypes.GoldMine
    })
  );
}

// B R U T E   M O D I F I E R S
function createBruteModifiers() {
  // Brute vs. Swordsman
  ArchetypeModifier.set(
    CombatArchetypes.Brute,
    CombatArchetypes.Swordsman,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Brute,
      defenderArchetype: CombatArchetypes.Swordsman
    })
  );
  // Brute vs. Pikeman
  ArchetypeModifier.set(
    CombatArchetypes.Brute,
    CombatArchetypes.Pikeman,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Brute,
      defenderArchetype: CombatArchetypes.Pikeman
    })
  );
  // Brute vs. Golem
  ArchetypeModifier.set(
    CombatArchetypes.Brute,
    CombatArchetypes.Golem,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Brute,
      defenderArchetype: CombatArchetypes.Golem
    })
  );
  // Brute vs. Rider
  ArchetypeModifier.set(
    CombatArchetypes.Brute,
    CombatArchetypes.Rider,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Brute,
      defenderArchetype: CombatArchetypes.Rider
    })
  );
  // Brute vs. Knight
  ArchetypeModifier.set(
    CombatArchetypes.Brute,
    CombatArchetypes.Knight,
    ArchetypeModifierData({
      mod: 50,
      attackerArchetype: CombatArchetypes.Brute,
      defenderArchetype: CombatArchetypes.Knight
    })
  );
  // Brute vs. Dragon
  ArchetypeModifier.set(
    CombatArchetypes.Brute,
    CombatArchetypes.Dragon,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Brute,
      defenderArchetype: CombatArchetypes.Dragon
    })
  );
  // Brute vs. Archer
  ArchetypeModifier.set(
    CombatArchetypes.Brute,
    CombatArchetypes.Archer,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Brute,
      defenderArchetype: CombatArchetypes.Archer
    })
  );
  // Brute vs. Catapult
  ArchetypeModifier.set(
    CombatArchetypes.Brute,
    CombatArchetypes.Catapult,
    ArchetypeModifierData({
      mod: 50,
      attackerArchetype: CombatArchetypes.Brute,
      defenderArchetype: CombatArchetypes.Catapult
    })
  );
  // Brute vs. Wizard
  ArchetypeModifier.set(
    CombatArchetypes.Brute,
    CombatArchetypes.Wizard,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Brute,
      defenderArchetype: CombatArchetypes.Wizard
    })
  );
  // Brute vs. Settlement
  ArchetypeModifier.set(
    CombatArchetypes.Brute,
    CombatArchetypes.Settlement,
    ArchetypeModifierData({
      mod: 50,
      attackerArchetype: CombatArchetypes.Brute,
      defenderArchetype: CombatArchetypes.Settlement
    })
  );
  // Brute vs. SpawnSettlement
  ArchetypeModifier.set(
    CombatArchetypes.Brute,
    CombatArchetypes.SpawnSettlement,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Brute,
      defenderArchetype: CombatArchetypes.SpawnSettlement
    })
  );
  // Brute vs. GoldMine
  ArchetypeModifier.set(
    CombatArchetypes.Brute,
    CombatArchetypes.GoldMine,
    ArchetypeModifierData({
      mod: 50,
      attackerArchetype: CombatArchetypes.Brute,
      defenderArchetype: CombatArchetypes.GoldMine
    })
  );
}

//
// R I D E R   M O D I F I E R S
function createRiderModifiers() {
  // Rider vs. Swordsman
  ArchetypeModifier.set(
    CombatArchetypes.Rider,
    CombatArchetypes.Swordsman,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Rider,
      defenderArchetype: CombatArchetypes.Swordsman
    })
  );
  // Rider vs. Pikeman
  ArchetypeModifier.set(
    CombatArchetypes.Rider,
    CombatArchetypes.Pikeman,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Rider,
      defenderArchetype: CombatArchetypes.Pikeman
    })
  );
  // Rider vs. Golem
  ArchetypeModifier.set(
    CombatArchetypes.Rider,
    CombatArchetypes.Golem,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Rider,
      defenderArchetype: CombatArchetypes.Golem
    })
  );

  // Rider vs. Brute
  ArchetypeModifier.set(
    CombatArchetypes.Rider,
    CombatArchetypes.Brute,
    ArchetypeModifierData({
      mod: -50,
      attackerArchetype: CombatArchetypes.Rider,
      defenderArchetype: CombatArchetypes.Brute
    })
  );

  // Rider vs. Rider
  ArchetypeModifier.set(
    CombatArchetypes.Rider,
    CombatArchetypes.Rider,
    ArchetypeModifierData({
      mod: -50,
      attackerArchetype: CombatArchetypes.Rider,
      defenderArchetype: CombatArchetypes.Rider
    })
  );

  // Rider vs. Knight
  ArchetypeModifier.set(
    CombatArchetypes.Rider,
    CombatArchetypes.Knight,
    ArchetypeModifierData({
      mod: -50,
      attackerArchetype: CombatArchetypes.Rider,
      defenderArchetype: CombatArchetypes.Knight
    })
  );
  // Rider vs. Dragon
  ArchetypeModifier.set(
    CombatArchetypes.Rider,
    CombatArchetypes.Dragon,
    ArchetypeModifierData({
      mod: -50,
      attackerArchetype: CombatArchetypes.Rider,
      defenderArchetype: CombatArchetypes.Dragon
    })
  );
  // Rider vs. Archer
  ArchetypeModifier.set(
    CombatArchetypes.Rider,
    CombatArchetypes.Archer,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Rider,
      defenderArchetype: CombatArchetypes.Archer
    })
  );
  // Rider vs. Catapult
  ArchetypeModifier.set(
    CombatArchetypes.Rider,
    CombatArchetypes.Catapult,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Rider,
      defenderArchetype: CombatArchetypes.Catapult
    })
  );
  // Rider vs. Wizard
  ArchetypeModifier.set(
    CombatArchetypes.Rider,
    CombatArchetypes.Wizard,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Rider,
      defenderArchetype: CombatArchetypes.Wizard
    })
  );
  // Rider vs. Settlement
  ArchetypeModifier.set(
    CombatArchetypes.Rider,
    CombatArchetypes.Settlement,
    ArchetypeModifierData({
      mod: 150,
      attackerArchetype: CombatArchetypes.Rider,
      defenderArchetype: CombatArchetypes.Settlement
    })
  );
  // Rider vs. SpawnSettlement
  ArchetypeModifier.set(
    CombatArchetypes.Rider,
    CombatArchetypes.SpawnSettlement,
    ArchetypeModifierData({
      mod: 50,
      attackerArchetype: CombatArchetypes.Rider,
      defenderArchetype: CombatArchetypes.SpawnSettlement
    })
  );
  // Rider vs. GoldMine
  ArchetypeModifier.set(
    CombatArchetypes.Rider,
    CombatArchetypes.GoldMine,
    ArchetypeModifierData({
      mod: 150,
      attackerArchetype: CombatArchetypes.Rider,
      defenderArchetype: CombatArchetypes.GoldMine
    })
  );
}

//
// K N I G H T   M O D I F I E R S
function createKnightModifiers() {
  // Knight vs. Swordsman
  ArchetypeModifier.set(
    CombatArchetypes.Knight,
    CombatArchetypes.Swordsman,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Knight,
      defenderArchetype: CombatArchetypes.Swordsman
    })
  );
  // Knight vs. Pikeman
  ArchetypeModifier.set(
    CombatArchetypes.Knight,
    CombatArchetypes.Pikeman,
    ArchetypeModifierData({
      mod: -50,
      attackerArchetype: CombatArchetypes.Knight,
      defenderArchetype: CombatArchetypes.Pikeman
    })
  );
  // Knight vs. Golem
  ArchetypeModifier.set(
    CombatArchetypes.Knight,
    CombatArchetypes.Golem,
    ArchetypeModifierData({
      mod: -50,
      attackerArchetype: CombatArchetypes.Knight,
      defenderArchetype: CombatArchetypes.Golem
    })
  );

  // Knight vs. Brute
  ArchetypeModifier.set(
    CombatArchetypes.Knight,
    CombatArchetypes.Brute,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Knight,
      defenderArchetype: CombatArchetypes.Brute
    })
  );

  // Knight vs. Rider
  ArchetypeModifier.set(
    CombatArchetypes.Knight,
    CombatArchetypes.Rider,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Knight,
      defenderArchetype: CombatArchetypes.Rider
    })
  );
  // Knight vs. Dragon
  ArchetypeModifier.set(
    CombatArchetypes.Knight,
    CombatArchetypes.Dragon,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Knight,
      defenderArchetype: CombatArchetypes.Dragon
    })
  );
  // Knight vs. Archer
  ArchetypeModifier.set(
    CombatArchetypes.Knight,
    CombatArchetypes.Archer,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Knight,
      defenderArchetype: CombatArchetypes.Archer
    })
  );
  // Knight vs. Catapult
  ArchetypeModifier.set(
    CombatArchetypes.Knight,
    CombatArchetypes.Catapult,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Knight,
      defenderArchetype: CombatArchetypes.Catapult
    })
  );
  // Knight vs. Wizard
  ArchetypeModifier.set(
    CombatArchetypes.Knight,
    CombatArchetypes.Wizard,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Knight,
      defenderArchetype: CombatArchetypes.Wizard
    })
  );
  // Knight vs. Settlement
  ArchetypeModifier.set(
    CombatArchetypes.Knight,
    CombatArchetypes.Settlement,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Knight,
      defenderArchetype: CombatArchetypes.Settlement
    })
  );
  // Knight vs. SpawnSettlement
  ArchetypeModifier.set(
    CombatArchetypes.Knight,
    CombatArchetypes.SpawnSettlement,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Knight,
      defenderArchetype: CombatArchetypes.SpawnSettlement
    })
  );
  // Knight vs. GoldMine
  ArchetypeModifier.set(
    CombatArchetypes.Knight,
    CombatArchetypes.GoldMine,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Knight,
      defenderArchetype: CombatArchetypes.GoldMine
    })
  );
}

//
// D R A G O N   M O D I F I E R S
function createDragonModifiers() {
  // Dragon vs. Swordsman
  ArchetypeModifier.set(
    CombatArchetypes.Dragon,
    CombatArchetypes.Swordsman,
    ArchetypeModifierData({
      mod: 50,
      attackerArchetype: CombatArchetypes.Dragon,
      defenderArchetype: CombatArchetypes.Swordsman
    })
  );
  // Dragon vs. Pikeman
  ArchetypeModifier.set(
    CombatArchetypes.Dragon,
    CombatArchetypes.Pikeman,
    ArchetypeModifierData({
      mod: -50,
      attackerArchetype: CombatArchetypes.Dragon,
      defenderArchetype: CombatArchetypes.Pikeman
    })
  );
  // Dragon vs. Golem
  ArchetypeModifier.set(
    CombatArchetypes.Dragon,
    CombatArchetypes.Golem,
    ArchetypeModifierData({
      mod: -50,
      attackerArchetype: CombatArchetypes.Dragon,
      defenderArchetype: CombatArchetypes.Golem
    })
  );
  // Dragon vs. Brute
  ArchetypeModifier.set(
    CombatArchetypes.Dragon,
    CombatArchetypes.Brute,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Dragon,
      defenderArchetype: CombatArchetypes.Brute
    })
  );
  // Dragon vs. Rider
  ArchetypeModifier.set(
    CombatArchetypes.Dragon,
    CombatArchetypes.Rider,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Dragon,
      defenderArchetype: CombatArchetypes.Rider
    })
  );
  // Dragon vs. Knight
  ArchetypeModifier.set(
    CombatArchetypes.Dragon,
    CombatArchetypes.Knight,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Dragon,
      defenderArchetype: CombatArchetypes.Knight
    })
  );
  // Dragon vs. Archer
  ArchetypeModifier.set(
    CombatArchetypes.Dragon,
    CombatArchetypes.Archer,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Dragon,
      defenderArchetype: CombatArchetypes.Archer
    })
  );
  // Dragon vs. Catapult
  ArchetypeModifier.set(
    CombatArchetypes.Dragon,
    CombatArchetypes.Catapult,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Dragon,
      defenderArchetype: CombatArchetypes.Catapult
    })
  );
  // Dragon vs. Wizard
  ArchetypeModifier.set(
    CombatArchetypes.Dragon,
    CombatArchetypes.Wizard,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Dragon,
      defenderArchetype: CombatArchetypes.Wizard
    })
  );
  // Dragon vs. Settlement
  ArchetypeModifier.set(
    CombatArchetypes.Dragon,
    CombatArchetypes.Settlement,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Dragon,
      defenderArchetype: CombatArchetypes.Settlement
    })
  );
  // Dragon vs. SpawnSettlement
  ArchetypeModifier.set(
    CombatArchetypes.Dragon,
    CombatArchetypes.SpawnSettlement,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Dragon,
      defenderArchetype: CombatArchetypes.SpawnSettlement
    })
  );
  // Dragon vs. GoldMine
  ArchetypeModifier.set(
    CombatArchetypes.Dragon,
    CombatArchetypes.GoldMine,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Dragon,
      defenderArchetype: CombatArchetypes.GoldMine
    })
  );
}

//
// A R C H E R   M O D I F I E R S
function createArcherModifiers() {
  // Archer vs. Swordsman
  ArchetypeModifier.set(
    CombatArchetypes.Archer,
    CombatArchetypes.Swordsman,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Archer,
      defenderArchetype: CombatArchetypes.Swordsman
    })
  );
  // Archer vs. Pikeman
  ArchetypeModifier.set(
    CombatArchetypes.Archer,
    CombatArchetypes.Pikeman,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Archer,
      defenderArchetype: CombatArchetypes.Pikeman
    })
  );
  // Archer vs. Golem
  ArchetypeModifier.set(
    CombatArchetypes.Archer,
    CombatArchetypes.Golem,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Archer,
      defenderArchetype: CombatArchetypes.Golem
    })
  );
  // Archer vs. Brute
  ArchetypeModifier.set(
    CombatArchetypes.Archer,
    CombatArchetypes.Brute,
    ArchetypeModifierData({
      mod: 25,
      attackerArchetype: CombatArchetypes.Archer,
      defenderArchetype: CombatArchetypes.Brute
    })
  );
  // Archer vs. Rider
  ArchetypeModifier.set(
    CombatArchetypes.Archer,
    CombatArchetypes.Rider,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Archer,
      defenderArchetype: CombatArchetypes.Rider
    })
  );
  // Archer vs. Knight
  ArchetypeModifier.set(
    CombatArchetypes.Archer,
    CombatArchetypes.Knight,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Archer,
      defenderArchetype: CombatArchetypes.Knight
    })
  );
  // Archer vs. Dragon
  ArchetypeModifier.set(
    CombatArchetypes.Archer,
    CombatArchetypes.Dragon,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Archer,
      defenderArchetype: CombatArchetypes.Dragon
    })
  );
  // Archer vs. Catapult
  ArchetypeModifier.set(
    CombatArchetypes.Archer,
    CombatArchetypes.Catapult,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Archer,
      defenderArchetype: CombatArchetypes.Catapult
    })
  );
  // Archer vs. Wizard
  ArchetypeModifier.set(
    CombatArchetypes.Archer,
    CombatArchetypes.Wizard,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Archer,
      defenderArchetype: CombatArchetypes.Wizard
    })
  );
  // Archer vs. Settlement
  ArchetypeModifier.set(
    CombatArchetypes.Archer,
    CombatArchetypes.Settlement,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Archer,
      defenderArchetype: CombatArchetypes.Settlement
    })
  );
  // Archer vs. SpawnSettlement
  ArchetypeModifier.set(
    CombatArchetypes.Archer,
    CombatArchetypes.SpawnSettlement,
    ArchetypeModifierData({
      mod: -50,
      attackerArchetype: CombatArchetypes.Archer,
      defenderArchetype: CombatArchetypes.SpawnSettlement
    })
  );
  // Archer vs. GoldMine
  ArchetypeModifier.set(
    CombatArchetypes.Archer,
    CombatArchetypes.GoldMine,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Archer,
      defenderArchetype: CombatArchetypes.GoldMine
    })
  );
}

//
// C A T A P U L T   M O D I F I E R S
function createCatapultModifiers() {
  // Catapult vs. Swordsman
  ArchetypeModifier.set(
    CombatArchetypes.Catapult,
    CombatArchetypes.Swordsman,
    ArchetypeModifierData({
      mod: 50,
      attackerArchetype: CombatArchetypes.Catapult,
      defenderArchetype: CombatArchetypes.Swordsman
    })
  );
  // Catapult vs. Pikeman
  ArchetypeModifier.set(
    CombatArchetypes.Catapult,
    CombatArchetypes.Pikeman,
    ArchetypeModifierData({
      mod: 50,
      attackerArchetype: CombatArchetypes.Catapult,
      defenderArchetype: CombatArchetypes.Pikeman
    })
  );
  // Catapult vs. Golem
  ArchetypeModifier.set(
    CombatArchetypes.Catapult,
    CombatArchetypes.Golem,
    ArchetypeModifierData({
      mod: 50,
      attackerArchetype: CombatArchetypes.Catapult,
      defenderArchetype: CombatArchetypes.Golem
    })
  );
  // Catapult vs. Brute
  ArchetypeModifier.set(
    CombatArchetypes.Catapult,
    CombatArchetypes.Brute,
    ArchetypeModifierData({
      mod: 150,
      attackerArchetype: CombatArchetypes.Catapult,
      defenderArchetype: CombatArchetypes.Brute
    })
  );
  // Catapult vs. Rider
  ArchetypeModifier.set(
    CombatArchetypes.Catapult,
    CombatArchetypes.Rider,
    ArchetypeModifierData({
      mod: -50,
      attackerArchetype: CombatArchetypes.Catapult,
      defenderArchetype: CombatArchetypes.Rider
    })
  );
  // Catapult vs. Knight
  ArchetypeModifier.set(
    CombatArchetypes.Catapult,
    CombatArchetypes.Knight,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Catapult,
      defenderArchetype: CombatArchetypes.Knight
    })
  );
  // Catapult vs. Dragon
  ArchetypeModifier.set(
    CombatArchetypes.Catapult,
    CombatArchetypes.Dragon,
    ArchetypeModifierData({
      mod: -50,
      attackerArchetype: CombatArchetypes.Catapult,
      defenderArchetype: CombatArchetypes.Dragon
    })
  );
  // Catapult vs. Archer
  ArchetypeModifier.set(
    CombatArchetypes.Catapult,
    CombatArchetypes.Archer,
    ArchetypeModifierData({
      mod: 50,
      attackerArchetype: CombatArchetypes.Catapult,
      defenderArchetype: CombatArchetypes.Archer
    })
  );
  // Catapult vs. Wizard
  ArchetypeModifier.set(
    CombatArchetypes.Catapult,
    CombatArchetypes.Wizard,
    ArchetypeModifierData({
      mod: 50,
      attackerArchetype: CombatArchetypes.Catapult,
      defenderArchetype: CombatArchetypes.Wizard
    })
  );
  // Catapult vs. Settlement
  ArchetypeModifier.set(
    CombatArchetypes.Catapult,
    CombatArchetypes.Settlement,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Catapult,
      defenderArchetype: CombatArchetypes.Settlement
    })
  );
  // Catapult vs. SpawnSettlement
  ArchetypeModifier.set(
    CombatArchetypes.Catapult,
    CombatArchetypes.SpawnSettlement,
    ArchetypeModifierData({
      mod: 50,
      attackerArchetype: CombatArchetypes.Catapult,
      defenderArchetype: CombatArchetypes.SpawnSettlement
    })
  );
  // Catapult vs. GoldMine
  ArchetypeModifier.set(
    CombatArchetypes.Catapult,
    CombatArchetypes.GoldMine,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Catapult,
      defenderArchetype: CombatArchetypes.GoldMine
    })
  );
}

//
// W I Z A R D   M O D I F I E R S
function createWizardModifiers() {
  // Wizard vs. Swordsman
  ArchetypeModifier.set(
    CombatArchetypes.Wizard,
    CombatArchetypes.Swordsman,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Wizard,
      defenderArchetype: CombatArchetypes.Swordsman
    })
  );
  // Wizard vs. Pikeman
  ArchetypeModifier.set(
    CombatArchetypes.Wizard,
    CombatArchetypes.Pikeman,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Wizard,
      defenderArchetype: CombatArchetypes.Pikeman
    })
  );
  // Wizard vs. Golem
  ArchetypeModifier.set(
    CombatArchetypes.Wizard,
    CombatArchetypes.Golem,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Wizard,
      defenderArchetype: CombatArchetypes.Golem
    })
  );
  // Wizard vs. Brute
  ArchetypeModifier.set(
    CombatArchetypes.Wizard,
    CombatArchetypes.Brute,
    ArchetypeModifierData({
      mod: 50,
      attackerArchetype: CombatArchetypes.Wizard,
      defenderArchetype: CombatArchetypes.Brute
    })
  );
  // Wizard vs. Rider
  ArchetypeModifier.set(
    CombatArchetypes.Wizard,
    CombatArchetypes.Rider,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Wizard,
      defenderArchetype: CombatArchetypes.Rider
    })
  );
  // Wizard vs. Knight
  ArchetypeModifier.set(
    CombatArchetypes.Wizard,
    CombatArchetypes.Knight,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Wizard,
      defenderArchetype: CombatArchetypes.Knight
    })
  );
  // Wizard vs. Dragon
  ArchetypeModifier.set(
    CombatArchetypes.Wizard,
    CombatArchetypes.Dragon,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Wizard,
      defenderArchetype: CombatArchetypes.Dragon
    })
  );
  // Wizard vs. Archer
  ArchetypeModifier.set(
    CombatArchetypes.Wizard,
    CombatArchetypes.Archer,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Wizard,
      defenderArchetype: CombatArchetypes.Archer
    })
  );
  // Wizard vs. Catapult
  ArchetypeModifier.set(
    CombatArchetypes.Wizard,
    CombatArchetypes.Catapult,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Wizard,
      defenderArchetype: CombatArchetypes.Catapult
    })
  );
  // Wizard vs. Settlement
  ArchetypeModifier.set(
    CombatArchetypes.Wizard,
    CombatArchetypes.Settlement,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Wizard,
      defenderArchetype: CombatArchetypes.Settlement
    })
  );
  // Wizard vs. SpawnSettlement
  ArchetypeModifier.set(
    CombatArchetypes.Wizard,
    CombatArchetypes.SpawnSettlement,
    ArchetypeModifierData({
      mod: -50,
      attackerArchetype: CombatArchetypes.Wizard,
      defenderArchetype: CombatArchetypes.SpawnSettlement
    })
  );
  // Wizard vs. GoldMine
  ArchetypeModifier.set(
    CombatArchetypes.Wizard,
    CombatArchetypes.GoldMine,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Wizard,
      defenderArchetype: CombatArchetypes.GoldMine
    })
  );
}

function createArchetypeModifiers() {
  createSwordsmanModifiers();
  createPikemanModifiers();
  createGolemModifiers();
  createRiderModifiers();
  createKnightModifiers();
  createDragonModifiers();
  createArcherModifiers();
  createCatapultModifiers();
  createWizardModifiers();
  createBruteModifiers();
}
