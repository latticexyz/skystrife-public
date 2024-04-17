import { Assets, Sprites } from "./phaserConstants";
import PlayerColors from "../../Local/player-colors.json";

const baseSprites = {
  [Sprites.Blank]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/blank.png",
  },

  [Sprites.Boot]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/ui/icons/boot.png",
  },
  [Sprites.BootConfirm]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/ui/icons/boot-check.png",
  },
  [Sprites.Sword]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/combat/sword.png",
  },
  [Sprites.SwordConfirm]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/combat/sword-confirm.png",
  },
  [Sprites.SwordUp]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/combat/sword-up.png",
  },
  [Sprites.SwordDown]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/combat/sword-down.png",
  },
  [Sprites.Skull]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/combat/skull.png",
  },

  [Sprites.Shadow]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/base/shadow-round.png",
  },
  [Sprites.Settlement]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/structures/big/forward-settlement/0.png",
  },
  [Sprites.SpawnSettlement]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/structures/big/home-settlement/0.png",
  },
  [Sprites.SummoningAltar]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/structures/big/magic-portal/0.png",
  },
  [Sprites.WoodenWall]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/structures/big/wooden-barricade/0.png",
  },
  [Sprites.GoldCache]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/structures/big/gold-cache/0.png",
  },
  [Sprites.SelectUI]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/ui/icons/big-select.png",
  },
  [Sprites.Chain]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/ui/icons/chain.png",
  },
  [Sprites.Cog]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/ui/icons/cog.png",
  },

  [Sprites.Crystal]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/structures/big/power-crystal/0.png",
  },

  [Sprites.BarBackground]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/ui/bars/background.png",
  },
  [Sprites.HealthBar]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/ui/bars/green.png",
  },
  [Sprites.HealthBarTick]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/entity_bars/green-tick.png",
  },
  [Sprites.HealthBarRed]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/ui/bars/red.png",
  },
  [Sprites.HealthBarRedTick]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/entity_bars/red-tick.png",
  },
  [Sprites.GoldBar]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/ui/bars/yellow.png",
  },
  [Sprites.GoldBarTick]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/entity_bars/yellow-tick.png",
  },

  [Sprites.Banner]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/ui/banner/0.png",
  },

  [Sprites.Swordsman]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/units/swordsman/idle/0.png",
  },
  [Sprites.Pikeman]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/units/pikeman/idle/0.png",
  },
  [Sprites.Halberdier]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/units/halberdier/idle/0.png",
  },

  [Sprites.Archer]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/units/archer/idle/0.png",
  },
  [Sprites.Catapult]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/units/catapult/idle/0.png",
  },
  [Sprites.Marksman]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/units/marksman/idle/0.png",
  },

  [Sprites.Brute]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/units/brute/idle/0.png",
  },

  [Sprites.Pillager]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/units/pillager/idle/0.png",
  },
  [Sprites.Knight]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/units/knight/idle/0.png",
  },
  [Sprites.Dragoon]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/units/dragoon/idle/0.png",
  },

  [Sprites.GoldMine]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/greyscale/structures/big/generators/metal/0.png",
  },
  [Sprites.Gold]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/icons/gold/0.png",
  },
  [Sprites.Armor]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/icons/armor/blue.png",
  },
  [Sprites.NoArmor]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/icons/armor/white.png",
  },

  [Sprites.GrassPreview]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/terrain_preview/grass.png",
  },
  [Sprites.MountainPreview]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/terrain_preview/mountain.png",
  },
  [Sprites.ForestPreview]: {
    assetKey: Assets.MainAtlas,
    frame: "sprites/terrain_preview/forest.png",
  },
} as Record<number | string, { assetKey: Assets; frame: string }>;

export const getSprites = () => {
  // add sprites for each player color
  Object.entries(baseSprites).forEach(([key, data]) => {
    if (!data.frame.includes("sprites/greyscale")) return;

    const colorKeys = Object.values(PlayerColors).slice(0, 5);

    colorKeys.forEach((color) => {
      const newSprite = { ...data };

      newSprite.frame = `sprites/tinted_images/${color}/${newSprite.frame.replace("sprites/greyscale/", "")}`;
      baseSprites[`${key}-${color}`] = newSprite;
    });
  });

  /**
   * Arrow sprites are coded depending on the neighboring arrow pieces.
   * Neighbors are coded using this schema:
   * 7 | 0 | 1
   * 6 | x | 2
   * 5 | 4 | 3
   * i.e. A straight arrow piece pointing horizontally with neighbors on both sides would be 26.
   * Numbers are written starting at 0 and going clockwise.
   *
   * Start and end are used because arrow pieces are different in these cases.
   */
  const arrowCodes = [
    "0-end",
    "0-start",
    "02",
    "04",
    "06",
    "2-end",
    "2-start",
    "24",
    "26",
    "4-end",
    "4-start",
    "46",
    "6-end",
    "6-start",
  ];
  for (const arrowCode of arrowCodes) {
    baseSprites[`ArrowAttack-${arrowCode}`] = {
      assetKey: Assets.MainAtlas,
      frame: `sprites/arrows/attack/${arrowCode}.png`,
    };
    baseSprites[`ArrowMove-${arrowCode}`] = {
      assetKey: Assets.MainAtlas,
      frame: `sprites/arrows/move/${arrowCode}.png`,
    };
  }

  return baseSprites;
};
