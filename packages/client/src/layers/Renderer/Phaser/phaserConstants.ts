import { UnitTypes, StructureTypes } from "../../Network";

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
  Blank,

  Settlement,
  SpawnSettlement,
  Gold,
  GoldMine,
  GoldCache,
  SelectUI,
  SummoningAltar,
  WoodenWall,
  Crystal,

  Chain,
  Cog,

  Swordsman,
  Pikeman,
  Halberdier,

  Archer,
  Catapult,
  Marksman,

  Pillager,
  Knight,
  Dragoon,

  Brute,

  BarBackground,
  HealthBar,
  HealthBarTick,
  HealthBarRed,
  HealthBarRedTick,
  GoldBar,
  GoldBarTick,

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
  TileOutlineBlue = "TileOutlineBlue",

  TileSelect = "TileSelect",
  Banner = "Banner",
  Gold = "Gold",

  // Structures
  SpawnSettlement = "SpawnSettlement",
  Settlement = "Settlement",
  GoldMine = "GoldMine",

  // Units
  SwordsmanIdle = "SwordsmanIdle",
  PikemanIdle = "PikemanIdle",
  HalberdierIdle = "HalberdierIdle",

  ArcherIdle = "ArcherIdle",
  CatapultIdle = "CatapultIdle",
  MarksmanIdle = "MarksmanIdle",

  PillagerIdle = "PillagerIdle",
  KnightIdle = "KnightIdle",
  DragoonIdle = "DragoonIdle",

  SwordsmanAttack = "SwordsmanAttack",
  PikemanAttack = "PikemanAttack",
  HalberdierAttack = "HalberdierAttack",

  ArcherAttack = "ArcherAttack",
  CatapultAttack = "CatapultAttack",
  MarksmanAttack = "MarksmanAttack",

  PillagerAttack = "PillagerAttack",
  KnightAttack = "KnightAttack",
  DragoonAttack = "DragoonAttack",

  SwordsmanDeath = "SwordsmanDeath",
  PikemanDeath = "PikemanDeath",
  HalberdierDeath = "HalberdierDeath",

  ArcherDeath = "ArcherDeath",
  CatapultDeath = "CatapultDeath",
  MarksmanDeath = "MarksmanDeath",

  PillagerDeath = "PillagerDeath",
  KnightDeath = "KnightDeath",
  DragoonDeath = "DragoonDeath",

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
    UnitTypes.Halberdier,
    UnitTypes.Archer,
    UnitTypes.Catapult,
    UnitTypes.Marksman,
    UnitTypes.Pillager,
    UnitTypes.Knight,
    UnitTypes.Dragoon,
    UnitTypes.Brute,
  ].reduce(
    (anims, unitType) => {
      anims[unitType] = [`${unitType}WalkUp`, `${unitType}WalkDown`, `${unitType}WalkLeft`, `${unitType}WalkRight`];

      return anims;
    },
    {} as Record<UnitTypes, [string, string, string, string]>,
  );
}

export const WALK_ANIMATIONS = createWalkAnimations();

export const UnitTypeSprites: Record<number, Sprites> = {
  [UnitTypes.Unknown]: Sprites.Gold,

  [UnitTypes.Swordsman]: Sprites.Swordsman,
  [UnitTypes.Pikeman]: Sprites.Pikeman,
  [UnitTypes.Halberdier]: Sprites.Halberdier,

  [UnitTypes.Archer]: Sprites.Archer,
  [UnitTypes.Catapult]: Sprites.Catapult,
  [UnitTypes.Marksman]: Sprites.Marksman,

  [UnitTypes.Pillager]: Sprites.Pillager,
  [UnitTypes.Knight]: Sprites.Knight,
  [UnitTypes.Dragoon]: Sprites.Dragoon,

  [UnitTypes.Brute]: Sprites.Brute,
};

export const StructureTypeSprites: Record<number, Sprites> = {
  [StructureTypes.Settlement]: Sprites.Settlement,
  [StructureTypes.SpawnSettlement]: Sprites.SpawnSettlement,
  [StructureTypes.WoodenWall]: Sprites.WoodenWall,
  [StructureTypes.GoldMine]: Sprites.GoldMine,
  [StructureTypes.GoldCache]: Sprites.GoldCache,
};

export const UnitTypeAnimations: Record<number, Animations> = {
  [UnitTypes.Swordsman]: Animations.SwordsmanIdle,
  [UnitTypes.Pikeman]: Animations.PikemanIdle,
  [UnitTypes.Halberdier]: Animations.HalberdierIdle,

  [UnitTypes.Archer]: Animations.ArcherIdle,
  [UnitTypes.Catapult]: Animations.CatapultIdle,
  [UnitTypes.Marksman]: Animations.MarksmanIdle,

  [UnitTypes.Pillager]: Animations.PillagerIdle,
  [UnitTypes.Knight]: Animations.KnightIdle,
  [UnitTypes.Dragoon]: Animations.DragoonIdle,

  [UnitTypes.Brute]: Animations.BruteIdle,
};

export const UnitTypeAttackAnimations: Record<number, Animations> = {
  [UnitTypes.Swordsman]: Animations.SwordsmanAttack,
  [UnitTypes.Pikeman]: Animations.PikemanAttack,
  [UnitTypes.Halberdier]: Animations.HalberdierAttack,

  [UnitTypes.Archer]: Animations.ArcherAttack,
  [UnitTypes.Catapult]: Animations.CatapultAttack,
  [UnitTypes.Marksman]: Animations.MarksmanAttack,

  [UnitTypes.Pillager]: Animations.PillagerAttack,
  [UnitTypes.Knight]: Animations.KnightAttack,
  [UnitTypes.Dragoon]: Animations.DragoonAttack,

  [UnitTypes.Brute]: Animations.BruteAttack,
};

export const UnitTypeDeathAnimations: Record<number, Animations> = {
  [UnitTypes.Swordsman]: Animations.SwordsmanDeath,
  [UnitTypes.Pikeman]: Animations.PikemanDeath,
  [UnitTypes.Halberdier]: Animations.HalberdierDeath,

  [UnitTypes.Archer]: Animations.ArcherDeath,
  [UnitTypes.Catapult]: Animations.CatapultDeath,
  [UnitTypes.Marksman]: Animations.MarksmanDeath,

  [UnitTypes.Pillager]: Animations.PillagerDeath,
  [UnitTypes.Knight]: Animations.KnightDeath,
  [UnitTypes.Dragoon]: Animations.DragoonDeath,

  [UnitTypes.Brute]: Animations.BruteDeath,
};

export const StructureTypeAnimations: Record<number, Animations> = {
  [StructureTypes.GoldMine]: Animations.GoldMine,
  [StructureTypes.SpawnSettlement]: Animations.SpawnSettlement,
  [StructureTypes.Settlement]: Animations.Settlement,
};
