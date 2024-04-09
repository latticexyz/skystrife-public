// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
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

  // Swordsman vs. Halberdier
  ArchetypeModifier.set(
    CombatArchetypes.Swordsman,
    CombatArchetypes.Halberdier,
    ArchetypeModifierData({
      mod: 50,
      attackerArchetype: CombatArchetypes.Swordsman,
      defenderArchetype: CombatArchetypes.Halberdier
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

  // Swordsman vs. Pillager
  ArchetypeModifier.set(
    CombatArchetypes.Swordsman,
    CombatArchetypes.Pillager,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Swordsman,
      defenderArchetype: CombatArchetypes.Pillager
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

  // Swordsman vs. Dragoon
  ArchetypeModifier.set(
    CombatArchetypes.Swordsman,
    CombatArchetypes.Dragoon,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Swordsman,
      defenderArchetype: CombatArchetypes.Dragoon
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

  // Swordsman vs. Marksman
  ArchetypeModifier.set(
    CombatArchetypes.Swordsman,
    CombatArchetypes.Marksman,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Swordsman,
      defenderArchetype: CombatArchetypes.Marksman
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
  // Pikeman vs. Pillager
  ArchetypeModifier.set(
    CombatArchetypes.Pikeman,
    CombatArchetypes.Pillager,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Pikeman,
      defenderArchetype: CombatArchetypes.Pillager
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
  // Pikeman vs. Dragoon
  ArchetypeModifier.set(
    CombatArchetypes.Pikeman,
    CombatArchetypes.Dragoon,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Pikeman,
      defenderArchetype: CombatArchetypes.Dragoon
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
  // Pikeman vs. Marksman
  ArchetypeModifier.set(
    CombatArchetypes.Pikeman,
    CombatArchetypes.Marksman,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Pikeman,
      defenderArchetype: CombatArchetypes.Marksman
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

// H A L B E R D I E R   M O D I F I E R S
function createHalberdierModifiers() {
  // Halberdier vs. Swordsman
  ArchetypeModifier.set(
    CombatArchetypes.Halberdier,
    CombatArchetypes.Swordsman,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Halberdier,
      defenderArchetype: CombatArchetypes.Swordsman
    })
  );

  // Halberdier vs. Brute
  ArchetypeModifier.set(
    CombatArchetypes.Halberdier,
    CombatArchetypes.Brute,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Halberdier,
      defenderArchetype: CombatArchetypes.Brute
    })
  );

  // Halberdier vs. Pillager
  ArchetypeModifier.set(
    CombatArchetypes.Halberdier,
    CombatArchetypes.Pillager,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Halberdier,
      defenderArchetype: CombatArchetypes.Pillager
    })
  );
  // Halberdier vs. Knight
  ArchetypeModifier.set(
    CombatArchetypes.Halberdier,
    CombatArchetypes.Knight,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Halberdier,
      defenderArchetype: CombatArchetypes.Knight
    })
  );
  // Halberdier vs. Dragoon
  ArchetypeModifier.set(
    CombatArchetypes.Halberdier,
    CombatArchetypes.Dragoon,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Halberdier,
      defenderArchetype: CombatArchetypes.Dragoon
    })
  );
  // Halberdier vs. Archer
  ArchetypeModifier.set(
    CombatArchetypes.Halberdier,
    CombatArchetypes.Archer,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Halberdier,
      defenderArchetype: CombatArchetypes.Archer
    })
  );
  // Halberdier vs. Catapult
  ArchetypeModifier.set(
    CombatArchetypes.Halberdier,
    CombatArchetypes.Catapult,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Halberdier,
      defenderArchetype: CombatArchetypes.Catapult
    })
  );
  // Halberdier vs. Marksman
  ArchetypeModifier.set(
    CombatArchetypes.Halberdier,
    CombatArchetypes.Marksman,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Halberdier,
      defenderArchetype: CombatArchetypes.Marksman
    })
  );
  // Halberdier vs. Settlement
  ArchetypeModifier.set(
    CombatArchetypes.Halberdier,
    CombatArchetypes.Settlement,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Halberdier,
      defenderArchetype: CombatArchetypes.Settlement
    })
  );
  // Halberdier vs. SpawnSettlement
  ArchetypeModifier.set(
    CombatArchetypes.Halberdier,
    CombatArchetypes.SpawnSettlement,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Halberdier,
      defenderArchetype: CombatArchetypes.SpawnSettlement
    })
  );
  // Halberdier vs. GoldMine
  ArchetypeModifier.set(
    CombatArchetypes.Halberdier,
    CombatArchetypes.GoldMine,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Halberdier,
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
  // Brute vs. Halberdier
  ArchetypeModifier.set(
    CombatArchetypes.Brute,
    CombatArchetypes.Halberdier,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Brute,
      defenderArchetype: CombatArchetypes.Halberdier
    })
  );
  // Brute vs. Pillager
  ArchetypeModifier.set(
    CombatArchetypes.Brute,
    CombatArchetypes.Pillager,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Brute,
      defenderArchetype: CombatArchetypes.Pillager
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
  // Brute vs. Dragoon
  ArchetypeModifier.set(
    CombatArchetypes.Brute,
    CombatArchetypes.Dragoon,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Brute,
      defenderArchetype: CombatArchetypes.Dragoon
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
  // Brute vs. Marksman
  ArchetypeModifier.set(
    CombatArchetypes.Brute,
    CombatArchetypes.Marksman,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Brute,
      defenderArchetype: CombatArchetypes.Marksman
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
// P I L L A G E R   M O D I F I E R S
function createPillagerModifiers() {
  // Pillager vs. Swordsman
  ArchetypeModifier.set(
    CombatArchetypes.Pillager,
    CombatArchetypes.Swordsman,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Pillager,
      defenderArchetype: CombatArchetypes.Swordsman
    })
  );
  // Pillager vs. Pikeman
  ArchetypeModifier.set(
    CombatArchetypes.Pillager,
    CombatArchetypes.Pikeman,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Pillager,
      defenderArchetype: CombatArchetypes.Pikeman
    })
  );
  // Pillager vs. Halberdier
  ArchetypeModifier.set(
    CombatArchetypes.Pillager,
    CombatArchetypes.Halberdier,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Pillager,
      defenderArchetype: CombatArchetypes.Halberdier
    })
  );

  // Pillager vs. Brute
  ArchetypeModifier.set(
    CombatArchetypes.Pillager,
    CombatArchetypes.Brute,
    ArchetypeModifierData({
      mod: -50,
      attackerArchetype: CombatArchetypes.Pillager,
      defenderArchetype: CombatArchetypes.Brute
    })
  );

  // Pillager vs. Pillager
  ArchetypeModifier.set(
    CombatArchetypes.Pillager,
    CombatArchetypes.Pillager,
    ArchetypeModifierData({
      mod: -50,
      attackerArchetype: CombatArchetypes.Pillager,
      defenderArchetype: CombatArchetypes.Pillager
    })
  );

  // Pillager vs. Knight
  ArchetypeModifier.set(
    CombatArchetypes.Pillager,
    CombatArchetypes.Knight,
    ArchetypeModifierData({
      mod: -50,
      attackerArchetype: CombatArchetypes.Pillager,
      defenderArchetype: CombatArchetypes.Knight
    })
  );
  // Pillager vs. Dragoon
  ArchetypeModifier.set(
    CombatArchetypes.Pillager,
    CombatArchetypes.Dragoon,
    ArchetypeModifierData({
      mod: -50,
      attackerArchetype: CombatArchetypes.Pillager,
      defenderArchetype: CombatArchetypes.Dragoon
    })
  );
  // Pillager vs. Archer
  ArchetypeModifier.set(
    CombatArchetypes.Pillager,
    CombatArchetypes.Archer,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Pillager,
      defenderArchetype: CombatArchetypes.Archer
    })
  );
  // Pillager vs. Catapult
  ArchetypeModifier.set(
    CombatArchetypes.Pillager,
    CombatArchetypes.Catapult,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Pillager,
      defenderArchetype: CombatArchetypes.Catapult
    })
  );
  // Pillager vs. Marksman
  ArchetypeModifier.set(
    CombatArchetypes.Pillager,
    CombatArchetypes.Marksman,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Pillager,
      defenderArchetype: CombatArchetypes.Marksman
    })
  );
  // Pillager vs. Settlement
  ArchetypeModifier.set(
    CombatArchetypes.Pillager,
    CombatArchetypes.Settlement,
    ArchetypeModifierData({
      mod: 150,
      attackerArchetype: CombatArchetypes.Pillager,
      defenderArchetype: CombatArchetypes.Settlement
    })
  );
  // Pillager vs. SpawnSettlement
  ArchetypeModifier.set(
    CombatArchetypes.Pillager,
    CombatArchetypes.SpawnSettlement,
    ArchetypeModifierData({
      mod: 50,
      attackerArchetype: CombatArchetypes.Pillager,
      defenderArchetype: CombatArchetypes.SpawnSettlement
    })
  );
  // Pillager vs. GoldMine
  ArchetypeModifier.set(
    CombatArchetypes.Pillager,
    CombatArchetypes.GoldMine,
    ArchetypeModifierData({
      mod: 150,
      attackerArchetype: CombatArchetypes.Pillager,
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
  // Knight vs. Halberdier
  ArchetypeModifier.set(
    CombatArchetypes.Knight,
    CombatArchetypes.Halberdier,
    ArchetypeModifierData({
      mod: -50,
      attackerArchetype: CombatArchetypes.Knight,
      defenderArchetype: CombatArchetypes.Halberdier
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

  // Knight vs. Pillager
  ArchetypeModifier.set(
    CombatArchetypes.Knight,
    CombatArchetypes.Pillager,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Knight,
      defenderArchetype: CombatArchetypes.Pillager
    })
  );
  // Knight vs. Dragoon
  ArchetypeModifier.set(
    CombatArchetypes.Knight,
    CombatArchetypes.Dragoon,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Knight,
      defenderArchetype: CombatArchetypes.Dragoon
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
  // Knight vs. Marksman
  ArchetypeModifier.set(
    CombatArchetypes.Knight,
    CombatArchetypes.Marksman,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Knight,
      defenderArchetype: CombatArchetypes.Marksman
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
// D R A G O O N   M O D I F I E R S
function createDragoonModifiers() {
  // Dragoon vs. Swordsman
  ArchetypeModifier.set(
    CombatArchetypes.Dragoon,
    CombatArchetypes.Swordsman,
    ArchetypeModifierData({
      mod: 50,
      attackerArchetype: CombatArchetypes.Dragoon,
      defenderArchetype: CombatArchetypes.Swordsman
    })
  );
  // Dragoon vs. Pikeman
  ArchetypeModifier.set(
    CombatArchetypes.Dragoon,
    CombatArchetypes.Pikeman,
    ArchetypeModifierData({
      mod: -50,
      attackerArchetype: CombatArchetypes.Dragoon,
      defenderArchetype: CombatArchetypes.Pikeman
    })
  );
  // Dragoon vs. Halberdier
  ArchetypeModifier.set(
    CombatArchetypes.Dragoon,
    CombatArchetypes.Halberdier,
    ArchetypeModifierData({
      mod: -50,
      attackerArchetype: CombatArchetypes.Dragoon,
      defenderArchetype: CombatArchetypes.Halberdier
    })
  );
  // Dragoon vs. Brute
  ArchetypeModifier.set(
    CombatArchetypes.Dragoon,
    CombatArchetypes.Brute,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Dragoon,
      defenderArchetype: CombatArchetypes.Brute
    })
  );
  // Dragoon vs. Pillager
  ArchetypeModifier.set(
    CombatArchetypes.Dragoon,
    CombatArchetypes.Pillager,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Dragoon,
      defenderArchetype: CombatArchetypes.Pillager
    })
  );
  // Dragoon vs. Knight
  ArchetypeModifier.set(
    CombatArchetypes.Dragoon,
    CombatArchetypes.Knight,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Dragoon,
      defenderArchetype: CombatArchetypes.Knight
    })
  );
  // Dragoon vs. Archer
  ArchetypeModifier.set(
    CombatArchetypes.Dragoon,
    CombatArchetypes.Archer,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Dragoon,
      defenderArchetype: CombatArchetypes.Archer
    })
  );
  // Dragoon vs. Catapult
  ArchetypeModifier.set(
    CombatArchetypes.Dragoon,
    CombatArchetypes.Catapult,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Dragoon,
      defenderArchetype: CombatArchetypes.Catapult
    })
  );
  // Dragoon vs. Marksman
  ArchetypeModifier.set(
    CombatArchetypes.Dragoon,
    CombatArchetypes.Marksman,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Dragoon,
      defenderArchetype: CombatArchetypes.Marksman
    })
  );
  // Dragoon vs. Settlement
  ArchetypeModifier.set(
    CombatArchetypes.Dragoon,
    CombatArchetypes.Settlement,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Dragoon,
      defenderArchetype: CombatArchetypes.Settlement
    })
  );
  // Dragoon vs. SpawnSettlement
  ArchetypeModifier.set(
    CombatArchetypes.Dragoon,
    CombatArchetypes.SpawnSettlement,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Dragoon,
      defenderArchetype: CombatArchetypes.SpawnSettlement
    })
  );
  // Dragoon vs. GoldMine
  ArchetypeModifier.set(
    CombatArchetypes.Dragoon,
    CombatArchetypes.GoldMine,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Dragoon,
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
  // Archer vs. Halberdier
  ArchetypeModifier.set(
    CombatArchetypes.Archer,
    CombatArchetypes.Halberdier,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Archer,
      defenderArchetype: CombatArchetypes.Halberdier
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
  // Archer vs. Pillager
  ArchetypeModifier.set(
    CombatArchetypes.Archer,
    CombatArchetypes.Pillager,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Archer,
      defenderArchetype: CombatArchetypes.Pillager
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
  // Archer vs. Dragoon
  ArchetypeModifier.set(
    CombatArchetypes.Archer,
    CombatArchetypes.Dragoon,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Archer,
      defenderArchetype: CombatArchetypes.Dragoon
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
  // Archer vs. Marksman
  ArchetypeModifier.set(
    CombatArchetypes.Archer,
    CombatArchetypes.Marksman,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Archer,
      defenderArchetype: CombatArchetypes.Marksman
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
  // Catapult vs. Halberdier
  ArchetypeModifier.set(
    CombatArchetypes.Catapult,
    CombatArchetypes.Halberdier,
    ArchetypeModifierData({
      mod: 50,
      attackerArchetype: CombatArchetypes.Catapult,
      defenderArchetype: CombatArchetypes.Halberdier
    })
  );
  // Catapult vs. Brute
  ArchetypeModifier.set(
    CombatArchetypes.Catapult,
    CombatArchetypes.Brute,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Catapult,
      defenderArchetype: CombatArchetypes.Brute
    })
  );
  // Catapult vs. Pillager
  ArchetypeModifier.set(
    CombatArchetypes.Catapult,
    CombatArchetypes.Pillager,
    ArchetypeModifierData({
      mod: -50,
      attackerArchetype: CombatArchetypes.Catapult,
      defenderArchetype: CombatArchetypes.Pillager
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
  // Catapult vs. Dragoon
  ArchetypeModifier.set(
    CombatArchetypes.Catapult,
    CombatArchetypes.Dragoon,
    ArchetypeModifierData({
      mod: -50,
      attackerArchetype: CombatArchetypes.Catapult,
      defenderArchetype: CombatArchetypes.Dragoon
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
  // Catapult vs. Marksman
  ArchetypeModifier.set(
    CombatArchetypes.Catapult,
    CombatArchetypes.Marksman,
    ArchetypeModifierData({
      mod: 50,
      attackerArchetype: CombatArchetypes.Catapult,
      defenderArchetype: CombatArchetypes.Marksman
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
function createMarksmanModifiers() {
  // Marksman vs. Swordsman
  ArchetypeModifier.set(
    CombatArchetypes.Marksman,
    CombatArchetypes.Swordsman,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Marksman,
      defenderArchetype: CombatArchetypes.Swordsman
    })
  );
  // Marksman vs. Pikeman
  ArchetypeModifier.set(
    CombatArchetypes.Marksman,
    CombatArchetypes.Pikeman,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Marksman,
      defenderArchetype: CombatArchetypes.Pikeman
    })
  );
  // Marksman vs. Halberdier
  ArchetypeModifier.set(
    CombatArchetypes.Marksman,
    CombatArchetypes.Halberdier,
    ArchetypeModifierData({
      mod: 100,
      attackerArchetype: CombatArchetypes.Marksman,
      defenderArchetype: CombatArchetypes.Halberdier
    })
  );
  // Marksman vs. Brute
  ArchetypeModifier.set(
    CombatArchetypes.Marksman,
    CombatArchetypes.Brute,
    ArchetypeModifierData({
      mod: 50,
      attackerArchetype: CombatArchetypes.Marksman,
      defenderArchetype: CombatArchetypes.Brute
    })
  );
  // Marksman vs. Pillager
  ArchetypeModifier.set(
    CombatArchetypes.Marksman,
    CombatArchetypes.Pillager,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Marksman,
      defenderArchetype: CombatArchetypes.Pillager
    })
  );
  // Marksman vs. Knight
  ArchetypeModifier.set(
    CombatArchetypes.Marksman,
    CombatArchetypes.Knight,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Marksman,
      defenderArchetype: CombatArchetypes.Knight
    })
  );
  // Marksman vs. Dragoon
  ArchetypeModifier.set(
    CombatArchetypes.Marksman,
    CombatArchetypes.Dragoon,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Marksman,
      defenderArchetype: CombatArchetypes.Dragoon
    })
  );
  // Marksman vs. Archer
  ArchetypeModifier.set(
    CombatArchetypes.Marksman,
    CombatArchetypes.Archer,
    ArchetypeModifierData({
      mod: 0,
      attackerArchetype: CombatArchetypes.Marksman,
      defenderArchetype: CombatArchetypes.Archer
    })
  );
  // Marksman vs. Catapult
  ArchetypeModifier.set(
    CombatArchetypes.Marksman,
    CombatArchetypes.Catapult,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Marksman,
      defenderArchetype: CombatArchetypes.Catapult
    })
  );
  // Marksman vs. Settlement
  ArchetypeModifier.set(
    CombatArchetypes.Marksman,
    CombatArchetypes.Settlement,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Marksman,
      defenderArchetype: CombatArchetypes.Settlement
    })
  );
  // Marksman vs. SpawnSettlement
  ArchetypeModifier.set(
    CombatArchetypes.Marksman,
    CombatArchetypes.SpawnSettlement,
    ArchetypeModifierData({
      mod: -50,
      attackerArchetype: CombatArchetypes.Marksman,
      defenderArchetype: CombatArchetypes.SpawnSettlement
    })
  );
  // Marksman vs. GoldMine
  ArchetypeModifier.set(
    CombatArchetypes.Marksman,
    CombatArchetypes.GoldMine,
    ArchetypeModifierData({
      mod: -25,
      attackerArchetype: CombatArchetypes.Marksman,
      defenderArchetype: CombatArchetypes.GoldMine
    })
  );
}

function createArchetypeModifiers() {
  createSwordsmanModifiers();
  createPikemanModifiers();
  createHalberdierModifiers();
  createPillagerModifiers();
  createKnightModifiers();
  createDragoonModifiers();
  createArcherModifiers();
  createCatapultModifiers();
  createMarksmanModifiers();
  createBruteModifiers();
}
