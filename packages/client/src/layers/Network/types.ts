import { createNetworkLayer } from "./createNetworkLayer";

export type NetworkLayer = Awaited<ReturnType<typeof createNetworkLayer>>;
export type NetworkComponents = NetworkLayer["network"]["components"];

// Contract types
export enum ContractWorldEvent {
  ComponentValueSet = "ComponentValueSet",
  ComponentValueRemoved = "ComponentValueRemoved",
}

export enum UnitTypes {
  Unknown,

  Swordsman,
  Pikeman,
  Halberdier,

  Pillager,
  Knight,
  Dragoon,

  Archer,
  Catapult,
  Marksman,

  Brute,
}

export const UnitTypeNames: Record<number, string> = {
  [UnitTypes.Unknown]: "Unknown",

  [UnitTypes.Swordsman]: "Swordsman",
  [UnitTypes.Pikeman]: "Pikeman",
  [UnitTypes.Halberdier]: "Halberdier",

  [UnitTypes.Archer]: "Archer",
  [UnitTypes.Catapult]: "Crossbowman",
  [UnitTypes.Marksman]: "Marksman",

  [UnitTypes.Pillager]: "Pillager",
  [UnitTypes.Knight]: "Knight",
  [UnitTypes.Dragoon]: "Dragoon",

  [UnitTypes.Brute]: "Brute",
};

export const UnitTypeDescriptions: Record<number, string> = {
  [UnitTypes.Unknown]: "Unknown",

  [UnitTypes.Halberdier]: "Infantry Hero",
  [UnitTypes.Marksman]: "Ranged Hero",
  [UnitTypes.Dragoon]: "Cavalry Hero",
};

export enum StructureTypes {
  Unknown,
  Settlement,
  SpawnSettlement,
  GoldShrine,
  EscapePortal,
  Portal,
  Container,
  SummoningAltar,
  BlazingHeartShrine,
  WoodenWall,
  GoldMine,
  Village,
  EmberCrownShrine,

  CrystalGenerator,
  MetalGenerator,
  FossilGenerator,
  WidgetGenerator,

  // Client Only
  EmberCrownShrineRuins,
}

export const StructureTypeNames: Record<number, string> = {
  [StructureTypes.SpawnSettlement]: "Spawn Settlement",
  [StructureTypes.Settlement]: "Settlement",
  [StructureTypes.Village]: "Village",
  [StructureTypes.GoldShrine]: "Gold Shrine",
  [StructureTypes.EscapePortal]: "Escape Portal",
  [StructureTypes.Portal]: "Portal",
  [StructureTypes.Container]: "Container",
  [StructureTypes.SummoningAltar]: "Summoning Altar",
  [StructureTypes.BlazingHeartShrine]: "Crystal Heart Shrine",
  [StructureTypes.WoodenWall]: "Wooden Wall",
  [StructureTypes.GoldMine]: "Charging Crystal",
  [StructureTypes.EmberCrownShrine]: "Ember Crown Shrine",

  [StructureTypes.CrystalGenerator]: "Crystal Mine",
  [StructureTypes.MetalGenerator]: "Metal Mine",
  [StructureTypes.FossilGenerator]: "Fossil Pile",
  [StructureTypes.WidgetGenerator]: "Widget Pile",

  // Client Only
  [StructureTypes.EmberCrownShrineRuins]: "Ember Crown Shrine Ruins",
};

export enum ItemTypes {
  Unknown,
  Gold,
  EmberCrown,
  BlazingHeart,

  MovementBanner,
  SwordBanner,
  StaminaBanner,

  Crystal,
  Metal,
  Fossil,
  Widget,
}

export const ItemTypeNames: Record<number, string> = {
  [ItemTypes.Gold]: "Gold",
  [ItemTypes.EmberCrown]: "Ember Crown",
  [ItemTypes.BlazingHeart]: "Crystal Heart",

  [ItemTypes.MovementBanner]: "Movement Amplifier",
  [ItemTypes.SwordBanner]: "Strength Amplifier",
  [ItemTypes.StaminaBanner]: "Energy Amplifier",

  [ItemTypes.Crystal]: "Crystal",
  [ItemTypes.Metal]: "Metal",
  [ItemTypes.Fossil]: "Fossil",
  [ItemTypes.Widget]: "Widget",
};

export enum TerrainTypes {
  Unknown,
  Grass,
  Mountain,
  Water,
  Wall,
  Forest,
  StoneWall,

  LavaGround,
  LavaMountain,
  LavaForest,
  Lava,
  RockWall,
}

export const TerrainTypeNames: Record<number, string> = {
  [TerrainTypes.Grass]: "Grass",
  [TerrainTypes.Mountain]: "Mountain",
  [TerrainTypes.Water]: "Water",
  [TerrainTypes.Wall]: "Wall",
  [TerrainTypes.Forest]: "Forest",

  [TerrainTypes.LavaGround]: "Ground",
  [TerrainTypes.LavaMountain]: "Mountain",
  [TerrainTypes.LavaForest]: "Forest",
  [TerrainTypes.Lava]: "Lava",
};
