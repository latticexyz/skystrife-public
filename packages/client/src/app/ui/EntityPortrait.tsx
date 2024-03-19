import { Entity, getComponentValue } from "@latticexyz/recs";
import { SpriteImage } from "./Theme/SpriteImage";
import { useMUD } from "../../useMUD";
import { Sprites, StructureTypeSprites, UnitTypeSprites } from "../../layers/Renderer/Phaser/phaserConstants";
import { StructureTypes, UnitTypes } from "../../layers/Network";

export function EntityPortrait({ entity }: { entity: Entity }) {
  const {
    networkLayer: {
      components: { UnitType, StructureType },
      network: { matchEntity },
    },
    headlessLayer: {
      api: { getOwnerColor },
    },
  } = useMUD();

  const ownerColor = getOwnerColor(entity, matchEntity);
  const unitType = getComponentValue(UnitType, entity)?.value ?? 0;
  const structureType = getComponentValue(StructureType, entity)?.value ?? 0;

  return <Portrait unitType={unitType} structureType={structureType} colorName={ownerColor.name} />;
}

export function Portrait({
  unitType,
  structureType,
  colorName,
  scale = 1,
}: {
  unitType?: UnitTypes;
  structureType?: StructureTypes;
  colorName: string;
  scale?: number;
}) {
  let spriteKey: Sprites = Sprites.Cog;
  if (unitType) {
    spriteKey = UnitTypeSprites[unitType];
  } else if (structureType) {
    spriteKey = StructureTypeSprites[structureType];
  }

  const bannerSpriteKey = Sprites.Banner;

  return (
    <div
      style={{
        width: 96 * scale,
        height: 96 * scale,
      }}
      className="relative bg-white rounded border border-ss-stroke overflow-hidden"
    >
      {!structureType && unitType !== UnitTypes.Brute && unitType !== UnitTypes.Catapult ? (
        <div className="-translate-x-1/2">
          <SpriteImage spriteKey={spriteKey} colorName={colorName} scale={5 * scale} />
        </div>
      ) : null}

      {unitType === UnitTypes.Catapult ? (
        <div className="-translate-x-[6px] translate-y-[8px]">
          <SpriteImage spriteKey={spriteKey} colorName={colorName} scale={3 * scale} />
        </div>
      ) : null}

      {unitType === UnitTypes.Brute ? (
        <div className="-translate-x-2/3 -translate-y-[26px]">
          <SpriteImage spriteKey={spriteKey} colorName={colorName} scale={4 * scale} />
        </div>
      ) : null}

      {structureType === StructureTypes.GoldMine ? (
        <div className="-translate-x-[42px] -translate-y-6">
          <SpriteImage spriteKey={spriteKey} colorName={colorName} scale={3 * scale} />
        </div>
      ) : (
        <></>
      )}

      {structureType === StructureTypes.Settlement ? (
        <div className="-translate-x-[24px] translate-y-1">
          <SpriteImage spriteKey={spriteKey} colorName={colorName} scale={2 * scale} />
        </div>
      ) : (
        <></>
      )}

      {structureType === StructureTypes.SpawnSettlement ? (
        <div className="-translate-x-[18px] translate-y-3">
          <SpriteImage spriteKey={spriteKey} colorName={colorName} scale={2 * scale} />
        </div>
      ) : (
        <></>
      )}

      <div className="absolute top-0 right-0">
        <SpriteImage spriteKey={bannerSpriteKey} colorName={colorName} scale={4 * scale} />
      </div>
    </div>
  );
}
