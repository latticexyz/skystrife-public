import { UnitTypes, ItemTypes, StructureTypes } from "../../Network";

export const TILE_WIDTH = 32;
export const TILE_HEIGHT = 32;

export enum Scenes {
  Main = "Main",
  UI = "UI",
}

export enum Maps {
  Main = "Main",
  Pixel = "Pixel",
  Tactic = "Tactic",
  Strategic = "Strategic",
}

export enum Assets {
  OverworldTileset = "OverworldTileset",
  MainAtlas = "MainAtlas",
  Background = "Background",
  TiledBackground = "TiledBackground",
  MinimapBackground = "MinimapBackground",
  CloudBackground = "CloudBackground",
  Cloud1 = "Cloud1",
  Cloud2 = "Cloud2",
  Professor = "Professor",
  Splash = "Splash",
  Gold = "Gold",
  Central = "Central",
  LeftMid = "LeftMid",
  RightMid = "RightMid",
  LeftCornerUpA = "LeftCornerUpA",
  LeftCornerUpB = "LeftCornerUpB",
  RightCornerUpA = "RightCornerUpA",
  RightCornerUpB = "RightCornerUpB",
  UpperEdge = "UpperEdge",
  UpperEdgeLeft = "UpperEdgeLeft",
  UpperEdgeRight = "UpperEdgeRight",
  LeftEdge = "LeftEdge",
  RightEdge = "RightEdge",
}

export enum Sprites {
  Settlement,
  SpawnSettlement,
  Gold,
  GoldMine,
  SelectUI,
  SummoningAltar,
  WoodenWall,
  Crystal,

  Chain,
  Cog,

  Swordsman,
  Pikeman,
  Golem,

  Archer,
  Catapult,
  Wizard,

  Rider,
  Knight,
  Dragon,

  Brute,

  BarBackground,
  HealthBar,
  HealthBarRed,
  GoldBar,

  Banner,

  ResourceBar,

  Shadow,

  Boot,
  BootConfirm,

  Sword,
  SwordConfirm,
  SwordUp,
  SwordDown,

  Armor,
  NoArmor,

  GrassPreview,
  MountainPreview,
  ForestPreview,

  Skull,
}

export enum Animations {
  //UI
  ChainCarousel = "ChainCarousel",
  Selection = "Selection",
  EnemySelection = "EnemySelection",

  TileHighlightRed = "TileHighlightRed",
  TileHighlightYellow = "TileHighlightYellow",
  TileOutlineRed = "TileOutlineRed",
  TileOutlineYellow = "TileOutlineYellow",
  TileOutlineWhite = "TileOutlineWhite",

  TileSelect = "TileSelect",
  Banner = "Banner",
  Gold = "Gold",

  // Structures
  Portal = "Portal",
  GoldShrine = "GoldShrine",
  GoldMine = "GoldMine",
  SummoningAltar = "SummoningAltar",
  Sphinx = "Sphinx",
  SpawnSettlement = "SpawnSettlement",
  Settlement = "Settlement",

  // Units
  SwordsmanIdle = "SwordsmanIdle",
  PikemanIdle = "PikemanIdle",
  GolemIdle = "GolemIdle",

  ArcherIdle = "ArcherIdle",
  CatapultIdle = "CatapultIdle",
  WizardIdle = "WizardIdle",

  RiderIdle = "RiderIdle",
  KnightIdle = "KnightIdle",
  DragonIdle = "DragonIdle",

  SwordsmanAttack = "SwordsmanAttack",
  PikemanAttack = "PikemanAttack",
  GolemAttack = "GolemAttack",

  ArcherAttack = "ArcherAttack",
  CatapultAttack = "CatapultAttack",
  WizardAttack = "WizardAttack",

  RiderAttack = "RiderAttack",
  KnightAttack = "KnightAttack",
  DragonAttack = "DragonAttack",

  SwordsmanDeath = "SwordsmanDeath",
  PikemanDeath = "PikemanDeath",
  GolemDeath = "GolemDeath",

  ArcherDeath = "ArcherDeath",
  CatapultDeath = "CatapultDeath",
  WizardDeath = "WizardDeath",

  RiderDeath = "RiderDeath",
  KnightDeath = "KnightDeath",
  DragonDeath = "DragonDeath",

  BruteIdle = "BruteIdle",
  BruteAttack = "BruteAttack",
  BruteDeath = "BruteDeath",

  Capture = "Capture",
  // Terrain
  LongGrass = "LongGrass",
}

function createWalkAnimations() {
  return [
    UnitTypes.Swordsman,
    UnitTypes.Pikeman,
    UnitTypes.Golem,
    UnitTypes.Archer,
    UnitTypes.Catapult,
    UnitTypes.Wizard,
    UnitTypes.Rider,
    UnitTypes.Knight,
    UnitTypes.Dragon,
    UnitTypes.Brute,
  ].reduce((anims, unitType) => {
    anims[unitType] = [`${unitType}WalkUp`, `${unitType}WalkDown`, `${unitType}WalkLeft`, `${unitType}WalkRight`];

    return anims;
  }, {} as Record<UnitTypes, [string, string, string, string]>);
}

export const WALK_ANIMATIONS = createWalkAnimations();

export const UnitTypeSprites: Record<number, Sprites> = {
  [UnitTypes.Unknown]: Sprites.Gold,

  [UnitTypes.Swordsman]: Sprites.Swordsman,
  [UnitTypes.Pikeman]: Sprites.Pikeman,
  [UnitTypes.Golem]: Sprites.Golem,

  [UnitTypes.Archer]: Sprites.Archer,
  [UnitTypes.Catapult]: Sprites.Catapult,
  [UnitTypes.Wizard]: Sprites.Wizard,

  [UnitTypes.Rider]: Sprites.Rider,
  [UnitTypes.Knight]: Sprites.Knight,
  [UnitTypes.Dragon]: Sprites.Dragon,

  [UnitTypes.Brute]: Sprites.Brute,
};

export const StructureTypeSprites: Record<number, Sprites> = {
  [StructureTypes.Settlement]: Sprites.Settlement,
  [StructureTypes.SpawnSettlement]: Sprites.SpawnSettlement,
  [StructureTypes.WoodenWall]: Sprites.WoodenWall,
  [StructureTypes.GoldMine]: Sprites.GoldMine,
};

export const UnitTypeAnimations: Record<number, Animations> = {
  [UnitTypes.Swordsman]: Animations.SwordsmanIdle,
  [UnitTypes.Pikeman]: Animations.PikemanIdle,
  [UnitTypes.Golem]: Animations.GolemIdle,

  [UnitTypes.Archer]: Animations.ArcherIdle,
  [UnitTypes.Catapult]: Animations.CatapultIdle,
  [UnitTypes.Wizard]: Animations.WizardIdle,

  [UnitTypes.Rider]: Animations.RiderIdle,
  [UnitTypes.Knight]: Animations.KnightIdle,
  [UnitTypes.Dragon]: Animations.DragonIdle,

  [UnitTypes.Brute]: Animations.BruteIdle,
};

export const UnitTypeAttackAnimations: Record<number, Animations> = {
  [UnitTypes.Swordsman]: Animations.SwordsmanAttack,
  [UnitTypes.Pikeman]: Animations.PikemanAttack,
  [UnitTypes.Golem]: Animations.GolemAttack,

  [UnitTypes.Archer]: Animations.ArcherAttack,
  [UnitTypes.Catapult]: Animations.CatapultAttack,
  [UnitTypes.Wizard]: Animations.WizardAttack,

  [UnitTypes.Rider]: Animations.RiderAttack,
  [UnitTypes.Knight]: Animations.KnightAttack,
  [UnitTypes.Dragon]: Animations.DragonAttack,

  [UnitTypes.Brute]: Animations.BruteAttack,
};

export const UnitTypeDeathAnimations: Record<number, Animations> = {
  [UnitTypes.Swordsman]: Animations.SwordsmanDeath,
  [UnitTypes.Pikeman]: Animations.PikemanDeath,
  [UnitTypes.Golem]: Animations.GolemDeath,

  [UnitTypes.Archer]: Animations.ArcherDeath,
  [UnitTypes.Catapult]: Animations.CatapultDeath,
  [UnitTypes.Wizard]: Animations.WizardDeath,

  [UnitTypes.Rider]: Animations.RiderDeath,
  [UnitTypes.Knight]: Animations.KnightDeath,
  [UnitTypes.Dragon]: Animations.DragonDeath,

  [UnitTypes.Brute]: Animations.BruteDeath,
};

export const StructureTypeAnimations: Record<number, Animations> = {
  [StructureTypes.EscapePortal]: Animations.Portal,
  [StructureTypes.Portal]: Animations.Portal,
  [StructureTypes.BlazingHeartShrine]: Animations.Sphinx,
  [StructureTypes.GoldMine]: Animations.GoldMine,
  [StructureTypes.SummoningAltar]: Animations.SummoningAltar,
  [StructureTypes.SpawnSettlement]: Animations.SpawnSettlement,
  [StructureTypes.Settlement]: Animations.Settlement,
};

export const ItemTypeAnimations: Record<number, Animations> = {};
