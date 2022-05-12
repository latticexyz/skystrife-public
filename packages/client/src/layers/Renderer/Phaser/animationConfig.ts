import { toLower } from "lodash";
import { UnitTypes } from "../../Network";
import { Animations, Assets, WALK_ANIMATIONS } from "./phaserConstants";
import PlayerColors from "../../Local/player-colors.json";

function createWalkAnimations() {
  const animationConfigs: {
    key: string;
    assetKey: Assets.MainAtlas;
    startFrame: number;
    endFrame: number;
    frameRate: number;
    repeat: number;
    prefix: string;
    suffix: string;
  }[] = [];

  for (const unitTypeString in UnitTypes) {
    const unitType = Number(unitTypeString) as UnitTypes;
    if (!WALK_ANIMATIONS[unitType]) continue;

    const folderName = toLower(UnitTypes[unitType]);
    const walkAnimationKeys = WALK_ANIMATIONS[unitType];
    const directions = ["up", "down", "left", "right"];

    walkAnimationKeys.forEach((key, i) => {
      animationConfigs.push({
        key,
        assetKey: Assets.MainAtlas,
        startFrame: 0,
        // Ranged unit walk animations are only 3 frames long
        // Why? I have no fucking idea
        endFrame: [UnitTypes.Archer, UnitTypes.Catapult, UnitTypes.Wizard].includes(unitType) ? 2 : 3,
        frameRate: 6,
        repeat: -1,
        prefix: `sprites/greyscale/units/${folderName}/walk/${directions[i]}/`,
        suffix: ".png",
      });
    });
  }

  return animationConfigs;
}

const baseAnimations = [
  //UI
  {
    key: Animations.Gold,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 0,
    frameRate: 0,
    repeat: 0,
    prefix: "sprites/icons/gold/",
    suffix: ".png",
  },
  {
    key: Animations.Banner,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 0,
    frameRate: 0,
    repeat: 0,
    prefix: "sprites/greyscale/ui/banner/",
    suffix: ".png",
  },

  {
    key: Animations.TileHighlightRed,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 2,
    frameRate: 3,
    repeat: -1,
    prefix: "sprites/tile_ui/red/highlight/",
    suffix: ".png",
  },
  {
    key: Animations.TileHighlightYellow,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 2,
    frameRate: 3,
    repeat: -1,
    prefix: "sprites/tile_ui/yellow/highlight/",
    suffix: ".png",
  },

  {
    key: Animations.TileOutlineRed,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 0,
    frameRate: 3,
    repeat: -1,
    prefix: "sprites/tile_ui/red/outline/",
    suffix: ".png",
  },
  {
    key: Animations.TileOutlineYellow,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 0,
    frameRate: 3,
    repeat: -1,
    prefix: "sprites/tile_ui/yellow/outline/",
    suffix: ".png",
  },
  {
    key: Animations.TileOutlineWhite,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 0,
    frameRate: 3,
    repeat: -1,
    prefix: "sprites/tile_ui/white/outline/",
    suffix: ".png",
  },

  {
    key: Animations.TileSelect,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 0,
    frameRate: 3,
    repeat: -1,
    prefix: "sprites/greyscale/ui/tile-select/",
    suffix: ".png",
  },

  {
    key: Animations.GoldMine,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 9,
    frameRate: 6,
    repeat: -1,
    prefix: "sprites/greyscale/structures/big/generators/metal/",
    suffix: ".png",
  },
  {
    key: Animations.SpawnSettlement,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 11,
    frameRate: 6,
    repeat: -1,
    prefix: "sprites/greyscale/structures/big/home-settlement-2/",
    suffix: ".png",
  },
  {
    key: Animations.Settlement,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 4,
    frameRate: 6,
    repeat: -1,
    prefix: "sprites/greyscale/structures/big/forward-settlement/",
    suffix: ".png",
  },

  // Units
  {
    key: Animations.SwordsmanIdle,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 3,
    frameRate: 6,
    repeat: -1,
    prefix: "sprites/greyscale/units/swordsman/idle/",
    suffix: ".png",
  },
  {
    key: Animations.SwordsmanAttack,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 5,
    frameRate: 6,
    repeat: 0,
    prefix: "sprites/greyscale/units/swordsman/attack/",
    suffix: ".png",
  },
  {
    key: Animations.SwordsmanDeath,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 5,
    frameRate: 6,
    repeat: 0,
    prefix: "sprites/greyscale/units/swordsman/death/",
    suffix: ".png",
  },

  {
    key: Animations.PikemanIdle,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 3,
    frameRate: 4,
    repeat: -1,
    prefix: "sprites/greyscale/units/pikeman/idle/",
    suffix: ".png",
  },
  {
    key: Animations.PikemanAttack,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 5,
    frameRate: 6,
    repeat: 0,
    prefix: "sprites/greyscale/units/pikeman/attack/",
    suffix: ".png",
  },
  {
    key: Animations.PikemanDeath,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 11,
    frameRate: 4,
    repeat: 0,
    prefix: "sprites/greyscale/units/pikeman/death/",
    suffix: ".png",
  },

  {
    key: Animations.GolemIdle,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 3,
    frameRate: 4,
    repeat: -1,
    prefix: "sprites/greyscale/units/golem/idle/",
    suffix: ".png",
  },
  {
    key: Animations.GolemAttack,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 5,
    frameRate: 6,
    repeat: 0,
    prefix: "sprites/greyscale/units/golem/attack/",
    suffix: ".png",
  },
  {
    key: Animations.GolemDeath,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 11,
    frameRate: 4,
    repeat: 0,
    prefix: "sprites/greyscale/units/golem/death/",
    suffix: ".png",
  },

  {
    key: Animations.ArcherIdle,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 3,
    frameRate: 4,
    repeat: -1,
    prefix: "sprites/greyscale/units/archer/idle/",
    suffix: ".png",
  },
  {
    key: Animations.ArcherAttack,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 5,
    frameRate: 6,
    repeat: 0,
    prefix: "sprites/greyscale/units/archer/attack/",
    suffix: ".png",
  },
  {
    key: Animations.ArcherDeath,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 5,
    frameRate: 4,
    repeat: 0,
    prefix: "sprites/greyscale/units/archer/death/",
    suffix: ".png",
  },

  {
    key: Animations.CatapultIdle,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 3,
    frameRate: 4,
    repeat: -1,
    prefix: "sprites/greyscale/units/catapult/idle/",
    suffix: ".png",
  },
  {
    key: Animations.CatapultAttack,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 5,
    frameRate: 6,
    repeat: 0,
    prefix: "sprites/greyscale/units/catapult/attack/",
    suffix: ".png",
  },
  {
    key: Animations.CatapultDeath,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 11,
    frameRate: 4,
    repeat: 0,
    prefix: "sprites/greyscale/units/catapult/death/",
    suffix: ".png",
  },

  {
    key: Animations.WizardIdle,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 3,
    frameRate: 4,
    repeat: -1,
    prefix: "sprites/greyscale/units/wizard/idle/",
    suffix: ".png",
  },
  {
    key: Animations.WizardAttack,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 5,
    frameRate: 6,
    repeat: 0,
    prefix: "sprites/greyscale/units/wizard/attack/",
    suffix: ".png",
  },
  {
    key: Animations.WizardDeath,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 11,
    frameRate: 4,
    repeat: 0,
    prefix: "sprites/greyscale/units/wizard/death/",
    suffix: ".png",
  },

  {
    key: Animations.RiderIdle,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 3,
    frameRate: 4,
    repeat: -1,
    prefix: "sprites/greyscale/units/rider/idle/",
    suffix: ".png",
  },
  {
    key: Animations.RiderAttack,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 5,
    frameRate: 6,
    repeat: 0,
    prefix: "sprites/greyscale/units/rider/attack/",
    suffix: ".png",
  },
  {
    key: Animations.RiderDeath,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 7,
    frameRate: 4,
    repeat: 0,
    prefix: "sprites/greyscale/units/rider/death/",
    suffix: ".png",
  },

  {
    key: Animations.KnightIdle,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 3,
    frameRate: 4,
    repeat: -1,
    prefix: "sprites/greyscale/units/knight/idle/",
    suffix: ".png",
  },
  {
    key: Animations.KnightAttack,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 5,
    frameRate: 6,
    repeat: 0,
    prefix: "sprites/greyscale/units/knight/attack/",
    suffix: ".png",
  },
  {
    key: Animations.KnightDeath,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 8,
    frameRate: 4,
    repeat: 0,
    prefix: "sprites/greyscale/units/knight/death/",
    suffix: ".png",
  },

  {
    key: Animations.DragonIdle,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 3,
    frameRate: 4,
    repeat: -1,
    prefix: "sprites/greyscale/units/dragon/idle/",
    suffix: ".png",
  },
  {
    key: Animations.DragonAttack,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 5,
    frameRate: 6,
    repeat: 0,
    prefix: "sprites/greyscale/units/dragon/attack/",
    suffix: ".png",
  },
  {
    key: Animations.DragonDeath,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 11,
    frameRate: 4,
    repeat: 0,
    prefix: "sprites/greyscale/units/dragon/death/",
    suffix: ".png",
  },
  {
    key: Animations.GoldMine,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 9,
    frameRate: 4,
    repeat: -1,
    prefix: "sprites/greyscale/structures/big/generators/metal/",
    suffix: ".png",
  },

  {
    key: Animations.Capture,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 28,
    frameRate: 6,
    repeat: 0,
    prefix: "sprites/greyscale/animations/capture/",
    suffix: ".png",
  },

  {
    key: Animations.LongGrass,
    assetKey: Assets.MainAtlas,
    startFrame: 0,
    endFrame: 7,
    frameRate: 6,
    repeat: -1,
    prefix: "sprites/terrain/grass/",
    suffix: ".png",
  },
  ...createWalkAnimations(),
];

// generate colored versions of all animations
baseAnimations.forEach((animation) => {
  if (!animation.prefix.includes("sprites/greyscale")) return;

  const colorKeys = Object.values(PlayerColors).slice(1, 5);
  colorKeys.forEach((color) => {
    const newAnimation = { ...animation };
    newAnimation.key = `${animation.key}-${color}`;
    newAnimation.prefix = `sprites/tinted_images/${color}/${animation.prefix.replace("sprites/greyscale/", "")}`;
    baseAnimations.push(newAnimation);
  });
});

export const getAnimations = () => baseAnimations;
