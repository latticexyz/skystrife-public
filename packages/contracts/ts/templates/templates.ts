import { stringToHex } from "viem";
import { TemplatesConfig } from "./templateConfig";
import config from "../../mud.config";

const settlementTemplate = {
  Combat: {
    health: 250_000,
    maxHealth: 250_000,
    armor: 0,
    strength: 0,
    structureStrength: 0,
    counterStrength: 0,
  },
  StructureType: { value: 1 },
  CombatArchetype: { value: 10 },
  Untraversable: { value: true },
  Capturable: { value: true },
  Charger: { value: 25 },
  ChargeCap: { cap: 750, totalCharged: 0 },
  Factory: {
    prototypeIds: [
      stringToHex("Swordsman", { size: 32 }),
      stringToHex("Pikeman", { size: 32 }),
      stringToHex("Rider", { size: 32 }),
      stringToHex("Archer", { size: 32 }),
      stringToHex("Knight", { size: 32 }),
      stringToHex("Brute", { size: 32 }),
      stringToHex("Catapult", { size: 32 }),
    ],
    staminaCosts: [100, 175, 200, 250, 375, 525, 700],
  },
} satisfies TemplatesConfig<typeof config>["Settlement"];

export const templates: TemplatesConfig<typeof config> = {
  Swordsman: {
    Combat: {
      health: 100_000,
      maxHealth: 100_000,
      armor: 0,
      strength: 40_000,
      structureStrength: 0,
      counterStrength: -30,
    },
    UnitType: { value: 1 },
    CombatArchetype: { value: 1 },
    StaminaOnKill: { value: 25 },
    Range: { min: 0, max: 1 },
    Movable: { value: 4_000 },
    Untraversable: { value: true },
    Tier: { value: 3 },
  },
  Pikeman: {
    Combat: {
      health: 120_000,
      maxHealth: 120_000,
      armor: 0,
      strength: 50_000,
      structureStrength: 0,
      counterStrength: -30,
    },
    UnitType: { value: 2 },
    CombatArchetype: { value: 2 },
    StaminaOnKill: { value: 50 },
    Range: { min: 0, max: 1 },
    Movable: { value: 4_000 },
    Untraversable: { value: true },
    Tier: { value: 3 },
  },
  Golem: {
    Combat: {
      health: 400_000,
      maxHealth: 400_000,
      armor: 0,
      strength: 70_000,
      structureStrength: 0,
      counterStrength: -30,
    },
    UnitType: { value: 3 },
    CombatArchetype: { value: 3 },
    StaminaOnKill: { value: 500 },
    Range: { min: 0, max: 1 },
    Movable: { value: 4_000 },
    Untraversable: { value: true },
    Tier: { value: 3 },
  },
  GodUnit: {
    Combat: {
      health: 1000000,
      maxHealth: 1000000,
      armor: 0,
      strength: 300000,
      structureStrength: 0,
      counterStrength: 100,
    },
    UnitType: { value: 3 },
    StaminaOnKill: { value: 250 },
    Range: { min: 0, max: 1 },
    Movable: { value: 6000 },
    Untraversable: { value: true },
    Tier: { value: 3 },
  },
  Rider: {
    Combat: {
      health: 100_000,
      maxHealth: 100_000,
      armor: 0,
      strength: 50_000,
      structureStrength: 0,
      counterStrength: -30,
    },
    UnitType: { value: 4 },
    CombatArchetype: { value: 4 },
    StaminaOnKill: { value: 50 },
    Range: { min: 0, max: 1 },
    Movable: { value: 5_000 },
    Untraversable: { value: true },
    Tier: { value: 3 },
  },
  Knight: {
    Combat: {
      health: 180_000,
      maxHealth: 180_000,
      armor: 0,
      strength: 50_000,
      structureStrength: 0,
      counterStrength: -30,
    },
    UnitType: { value: 5 },
    CombatArchetype: { value: 5 },
    StaminaOnKill: { value: 150 },
    Range: { min: 0, max: 1 },
    Movable: { value: 5_000 },
    Untraversable: { value: true },
    Tier: { value: 3 },
  },
  Dragon: {
    Combat: {
      health: 300_000,
      maxHealth: 300_000,
      armor: 0,
      strength: 70_000,
      structureStrength: 0,
      counterStrength: -30,
    },
    UnitType: { value: 6 },
    CombatArchetype: { value: 6 },
    StaminaOnKill: { value: 500 },
    Range: { min: 0, max: 1 },
    Movable: { value: 5_000 },
    Untraversable: { value: true },
    Tier: { value: 3 },
  },
  Archer: {
    Combat: {
      health: 100_000,
      maxHealth: 100_000,
      armor: 0,
      strength: 50_000,
      structureStrength: 0,
      counterStrength: -100,
    },
    UnitType: { value: 7 },
    CombatArchetype: { value: 7 },
    StaminaOnKill: { value: 100 },
    Range: { min: 2, max: 3 },
    Movable: { value: 3_000 },
    Untraversable: { value: true },
    Tier: { value: 3 },
  },
  Catapult: {
    Combat: {
      health: 120_000,
      maxHealth: 120_000,
      armor: 0,
      strength: 60_000,
      structureStrength: 0,
      counterStrength: -100,
    },
    UnitType: { value: 8 },
    CombatArchetype: { value: 8 },
    StaminaOnKill: { value: 250 },
    RequiresSetup: { value: true },
    Range: { min: 3, max: 4 },
    Movable: { value: 2_000 },
    Untraversable: { value: true },
    Tier: { value: 3 },
  },
  Wizard: {
    Combat: {
      health: 250_000,
      maxHealth: 250_000,
      armor: 0,
      strength: 70_000,
      structureStrength: 0,
      counterStrength: -100,
    },
    UnitType: { value: 9 },
    CombatArchetype: { value: 9 },
    StaminaOnKill: { value: 500 },
    Range: { min: 2, max: 2 },
    Movable: { value: 3_000 },
    Untraversable: { value: true },
    Tier: { value: 3 },
  },
  Brute: {
    Combat: {
      health: 300_000,
      maxHealth: 300_000,
      armor: 0,
      strength: 50_000,
      structureStrength: 0,
      counterStrength: -30,
    },
    UnitType: { value: 10 },
    CombatArchetype: { value: 13 },
    StaminaOnKill: { value: 200 },
    Range: { min: 0, max: 1 },
    Movable: { value: 2_500 },
    Untraversable: { value: true },
    Tier: { value: 3 },
  },
  Grass: {
    TerrainType: { value: 1 },
    MoveDifficulty: { value: 1000 },
  },
  Mountain: {
    TerrainType: { value: 2 },
    MoveDifficulty: { value: 2000 },
    ArmorModifier: { value: -30 }, // 30% less damage received
  },
  Water: {
    TerrainType: { value: 4 },
    Untraversable: { value: true },
  },
  Forest: {
    TerrainType: { value: 5 },
    MoveDifficulty: { value: 1500 },
    ArmorModifier: { value: -15 }, // 15% less damage received
  },
  StoneWall: {
    TerrainType: { value: 6 },
    Untraversable: { value: true },
  },
  LavaGround: {
    TerrainType: { value: 7 },
    MoveDifficulty: { value: 1000 },
  },
  Lava: {
    TerrainType: { value: 8 },
    Untraversable: { value: true },
  },
  LavaMountain: {
    TerrainType: { value: 9 },
    MoveDifficulty: { value: 2000 },
  },
  LavaForest: {
    TerrainType: { value: 10 },
    MoveDifficulty: { value: 1500 },
  },
  RockWall: {
    TerrainType: { value: 11 },
    Untraversable: { value: true },
  },

  MapCenterMarker: {
    MapCenter: { value: true },
  },

  // Structures
  Settlement: settlementTemplate,
  SpawnSettlement: {
    ...settlementTemplate,
    Combat: {
      health: 500_000,
      maxHealth: 500_000,
      armor: 0,
      strength: 0,
      structureStrength: 0,
      counterStrength: 0,
    },
    StructureType: { value: 2 },
    CombatArchetype: { value: 11 },
    Charger: { value: 25 },
    ChargeCap: { cap: 750, totalCharged: 0 },
    SpawnPoint: { value: true },
    StaminaOnKill: { value: 500 },
    // Overriding the value on `settlementTemplate`
    Capturable: { value: false },
  },
  GoldMine: {
    StructureType: { value: 10 },
    CombatArchetype: { value: 12 },
    Charger: { value: 50 },
    ChargeCap: { cap: 1_500, totalCharged: 0 },
    Capturable: { value: true },
    Untraversable: { value: true },
    Combat: {
      health: 150_000,
      maxHealth: 150_000,
      armor: 0,
      strength: 0,
      structureStrength: 0,
      counterStrength: 0,
    },
  },
  WoodenWall: {
    StructureType: { value: 9 },
    Combat: { health: 150000, maxHealth: 150000, armor: 0, strength: 0, structureStrength: 0, counterStrength: 0 },
    Untraversable: { value: true },
  },
};