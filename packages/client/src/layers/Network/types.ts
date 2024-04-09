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
  WoodenWall,
  GoldMine,
  GoldCache,
}

export const StructureTypeNames: Record<number, string> = {
  [StructureTypes.SpawnSettlement]: "Spawn Settlement",
  [StructureTypes.Settlement]: "Settlement",
  [StructureTypes.WoodenWall]: "Wooden Wall",
  [StructureTypes.GoldMine]: "Gold Mine",
  [StructureTypes.GoldCache]: "Gold Cache",
};

export enum TerrainTypes {
  Unknown,
  Grass,
  Mountain,
  Forest,
}

export const TerrainTypeNames: Record<number, string> = {
  [TerrainTypes.Grass]: "Grass",
  [TerrainTypes.Mountain]: "Mountain",
  [TerrainTypes.Forest]: "Forest",
};
