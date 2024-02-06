import { stringToHex } from "viem";
import { TemplatesConfig } from "./templateConfig";
import config from "../../mud.config";

const settlementTemplate = {
  StructureType: { value: 1 },
  Untraversable: { value: true },
  Capturable: { value: true },
  Charger: { value: 100 },
  ChargeCap: { cap: 2000, totalCharged: 0 },
  Combat: {
    health: 250_000,
    maxHealth: 200_000,
    armor: 0,
    strength: 0,
    structureStrength: 0,
    counterStrength: 0,
  },
  Factory: {
    prototypeIds: [
      stringToHex("Swordsman", { size: 32 }),
      stringToHex("Rider", { size: 32 }),
      stringToHex("Knight", { size: 32 }),
      stringToHex("Archer", { size: 32 }),
      stringToHex("Pikeman", { size: 32 }),
    ],
    staminaCosts: [500, 700, 900, 1100, 1800],
  },
} satisfies TemplatesConfig<typeof config>["Settlement"];

export const templates: TemplatesConfig<typeof config> = {
  Swordsman: {
    Combat: {
      health: 140_000,
      maxHealth: 140_000,
      armor: 10_000,
      strength: 50_000,
      structureStrength: 40_000,
      counterStrength: 70,
    },
    StaminaOnKill: { value: 125 },
    Range: { min: 0, max: 1 },
    Movable: { value: 3_500 },
    Untraversable: { value: true },
    Tier: { value: 3 },
    UnitType: { value: 1 },
  },
  Pikeman: {
    Combat: {
      health: 200_000,
      maxHealth: 200_000,
      armor: 15_000,
      strength: 80_000,
      structureStrength: 50_000,
      counterStrength: 70,
    },
    StaminaOnKill: { value: 450 },
    Range: { min: 0, max: 1 },
    Movable: { value: 3_000 },
    Untraversable: { value: true },
    Tier: { value: 3 },
    UnitType: { value: 2 },
  },
  Golem: {
    Combat: {
      health: 500_000,
      maxHealth: 500_000,
      armor: 20_000,
      strength: 100_000,
      structureStrength: 50_000,
      counterStrength: 70,
    },
    StaminaOnKill: { value: 1_000 },
    Range: { min: 0, max: 1 },
    Movable: { value: 3_000 },
    Untraversable: { value: true },
    Tier: { value: 3 },
    UnitType: { value: 3 },
  },
  GodUnit: {
    Combat: {
      health: 1000000,
      maxHealth: 1000000,
      armor: 20000,
      strength: 300000,
      structureStrength: 300000,
      counterStrength: 100,
    },
    StaminaOnKill: { value: 250 },
    Range: { min: 0, max: 1 },
    Movable: { value: 6000 },
    Untraversable: { value: true },
    Tier: { value: 3 },

    UnitType: { value: 3 },
  },
  Rider: {
    Combat: {
      health: 120_000,
      maxHealth: 120_000,
      armor: 0,
      strength: 30_000,
      structureStrength: 110_000,
      counterStrength: 50,
    },
    StaminaOnKill: { value: 175 },
    Range: { min: 0, max: 1 },
    Movable: { value: 5_000 },
    Untraversable: { value: true },
    Tier: { value: 3 },

    UnitType: { value: 4 },
  },
  Knight: {
    Combat: {
      health: 150_000,
      maxHealth: 150_000,
      armor: 10_000,
      strength: 60_000,
      structureStrength: 40_000,
      counterStrength: 70,
    },
    StaminaOnKill: { value: 225 },
    Range: { min: 0, max: 1 },
    Movable: { value: 5_000 },
    Untraversable: { value: true },
    Tier: { value: 3 },

    UnitType: { value: 5 },
  },
  Dragon: {
    Combat: {
      health: 350_000,
      maxHealth: 350_000,
      armor: 10_000,
      strength: 110_000,
      structureStrength: 40_000,
      counterStrength: 70,
    },
    StaminaOnKill: { value: 1_000 },
    Range: { min: 0, max: 1 },
    Movable: { value: 5_000 },
    Untraversable: { value: true },
    Tier: { value: 3 },

    UnitType: { value: 6 },
  },
  Archer: {
    Combat: {
      health: 100_000,
      maxHealth: 80_000,
      armor: 0,
      strength: 60_000,
      structureStrength: 30_000,
      counterStrength: 0,
    },
    StaminaOnKill: { value: 275 },
    Range: { min: 2, max: 3 },
    Movable: { value: 3_000 },
    Untraversable: { value: true },

    Tier: { value: 3 },
    UnitType: { value: 7 },
  },
  Catapult: {
    Combat: {
      health: 95000,
      maxHealth: 95000,
      armor: 3000,
      strength: 72000,
      structureStrength: 40000,
      counterStrength: 0,
    },
    StaminaOnKill: { value: 200 },

    Range: { min: 2, max: 3 },
    Movable: { value: 2500 },
    Untraversable: { value: true },
    Tier: { value: 3 },
    UnitType: { value: 8 },
  },
  Wizard: {
    Combat: {
      health: 250_000,
      maxHealth: 250_000,
      armor: 0,
      strength: 110_000,
      structureStrength: 30_000,
      counterStrength: 0,
    },
    StaminaOnKill: { value: 1_000 },
    Range: { min: 2, max: 2 },
    Movable: { value: 4_000 },
    Untraversable: { value: true },
    Tier: { value: 3 },
    UnitType: { value: 9 },
  },
  Grass: {
    TerrainType: { value: 1 },
    MoveDifficulty: { value: 1000 },
  },
  Mountain: {
    TerrainType: { value: 2 },
    MoveDifficulty: { value: 2000 },
    ArmorModifier: { value: 20_000 },
  },
  Water: {
    TerrainType: { value: 4 },
    Untraversable: { value: true },
  },
  Forest: {
    TerrainType: { value: 5 },
    MoveDifficulty: { value: 1500 },
    ArmorModifier: { value: 10_000 },
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
    Charger: { value: 100 },
    ChargeCap: { cap: 2_000, totalCharged: 0 },
    StructureType: { value: 2 },
    SpawnPoint: { value: true },
    Combat: {
      health: 500_000,
      maxHealth: 500_000,
      armor: 0,
      strength: 0,
      structureStrength: 0,
      counterStrength: 0,
    },
    StaminaOnKill: { value: 1_000 },
    // Overriding the value on `settlementTemplate`
    Capturable: { value: false },
  },
  GoldMine: {
    StructureType: { value: 10 },
    Charger: { value: 250 },
    ChargeCap: { cap: 5000, totalCharged: 0 },
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
