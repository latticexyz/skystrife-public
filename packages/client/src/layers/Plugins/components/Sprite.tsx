import { html } from "htm/preact";
import { Sprites, StructureTypeSprites, UnitTypeSprites } from "../../../layers/Renderer/Phaser/phaserConstants";
import { getSprites } from "../../../layers/Renderer/Phaser/spriteConfig";
import atlasJson from "../../../public/atlases/sprites/atlas.json";
import { StructureTypes, UnitTypes } from "../../Network";

export const Sprite = ({
  unitType,
  structureType,
  scale,
  colorName,
}: {
  unitType?: UnitTypes;
  structureType?: StructureTypes;
  scale?: number;
  colorName?: string;
}) => {
  let spriteKey = unitType != null && (UnitTypeSprites[unitType] as Sprites | undefined);
  if (!spriteKey) spriteKey = structureType != null && (StructureTypeSprites[structureType] as Sprites | undefined);
  if (!spriteKey) return null;

  const sprites = getSprites();

  const imageScale = scale ?? 1;
  let sprite = sprites[spriteKey];

  if (colorName) {
    const coloredSprite = sprites[`${spriteKey}-${colorName}`];

    if (!coloredSprite) {
      console.error("Could not find colored sprite", spriteKey, colorName);
    }

    sprite = coloredSprite;
  }

  const atlasDimensions = atlasJson.textures[0].size;
  const spriteAtlasEntry = atlasJson.textures[0].frames.find((atlasFrame) => atlasFrame.filename === sprite.frame);

  if (!spriteAtlasEntry) throw new Error(`Could not find sprite ${spriteKey} in atlas`);

  return html`
    <div
      style=${{
        width: `${spriteAtlasEntry.sourceSize.w * imageScale}px`,
        height: `${spriteAtlasEntry.sourceSize.h * imageScale}px`,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <img
        src="atlases/sprites/atlas.png"
        style=${{
          imageRendering: "pixelated",
          maxWidth: `${atlasDimensions.w * imageScale}px`,
          maxHeight: `${atlasDimensions.h * imageScale}px`,
          height: `${atlasDimensions.h * imageScale}px`,
          width: `${atlasDimensions.w * imageScale}px`,
          marginTop: `-${spriteAtlasEntry.frame.y * imageScale}px`,
          marginLeft: `-${spriteAtlasEntry.frame.x * imageScale}px`,
          clipPath: `inset(${spriteAtlasEntry.frame.y + 1}px ${
            atlasDimensions.w - (spriteAtlasEntry.frame.x + spriteAtlasEntry.sourceSize.w)
          }px ${atlasDimensions.h - (spriteAtlasEntry.frame.y + spriteAtlasEntry.sourceSize.h)}px ${
            spriteAtlasEntry.frame.x
          }px)`,
        }}
      />
    </div>
  `;
};
