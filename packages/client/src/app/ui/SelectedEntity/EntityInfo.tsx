import { Entity, Has, HasValue, getComponentValue } from "@latticexyz/recs";
import { Card } from "../Theme/SkyStrife/Card";
import { useMUD } from "../../../useMUD";
import { Sprites } from "../../../layers/Renderer/Phaser/phaserConstants";
import { SpriteImage } from "../Theme/SpriteImage";
import { TerrainTypes } from "../../../layers/Network";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { BYTES32_ZERO } from "../../../constants";
import { EntityPortrait } from "../EntityPortrait";

function Bar({
  backgroundColor,
  backgroundColorShadow,
  color,
  colorShadow,
  widthPercent,
  label,
  labelColor,
}: {
  backgroundColor: string;
  backgroundColorShadow: string;
  color: string;
  colorShadow: string;
  widthPercent: number;
  label: string;
  labelColor: string;
}) {
  return (
    <div className="flex gap-x-2 shadow-ss-small">
      <div
        style={{
          backgroundColor: backgroundColor,
          borderBottom: `2px solid ${backgroundColorShadow}`,
        }}
        className="relative w-[140px] h-6"
      >
        <div
          className="absolute left-0 h-6 border-b-2"
          style={{
            width: `${widthPercent}%`,
            backgroundColor: color,
            borderBottom: `2px solid ${colorShadow}`,
          }}
        />

        <div
          className="absolute font-medium text-[14px] translate-y-[1px] right-1/2 translate-x-1/2"
          style={{
            color: `${labelColor}`,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

function TerrainTypeImage({ terrain }: { terrain: TerrainTypes }) {
  if (terrain === TerrainTypes.Mountain) {
    return (
      <div className="rounded overflow-hidden">
        <SpriteImage scale={1} spriteKey={Sprites.MountainPreview} />
      </div>
    );
  }

  if (terrain === TerrainTypes.Forest) {
    return (
      <div className="rounded overflow-hidden">
        <SpriteImage scale={1} spriteKey={Sprites.ForestPreview} />
      </div>
    );
  }

  return (
    <div className="rounded overflow-hidden">
      <SpriteImage scale={1} spriteKey={Sprites.GrassPreview} />
    </div>
  );
}

function ArmorModifierImage({ modifier }: { modifier: number }) {
  if (modifier <= -30) {
    return (
      <div className="flex gap-x-1">
        <SpriteImage scale={1.5} spriteKey={Sprites.Armor} />
        <SpriteImage scale={1.5} spriteKey={Sprites.Armor} />
      </div>
    );
  }

  if (modifier <= -15) {
    return (
      <div className="flex gap-x-1">
        <SpriteImage scale={1.5} spriteKey={Sprites.Armor} />
        <SpriteImage scale={1.5} spriteKey={Sprites.NoArmor} />
      </div>
    );
  }

  return (
    <div className="flex gap-x-1">
      <SpriteImage scale={1.5} spriteKey={Sprites.NoArmor} />
      <SpriteImage scale={1.5} spriteKey={Sprites.NoArmor} />
    </div>
  );
}

export function EntityInfo({ entity }: { entity: Entity }) {
  const {
    networkLayer: {
      components: { UnitType, TerrainType, Combat, ArmorModifier, ChargeCap, Charger },
    },
    headlessLayer: {
      components: { OnCooldown },
    },
    localLayer: {
      components: { LocalPosition },
    },
  } = useMUD();

  const healthBarColors = {
    main: "#47EB47",
    shadow: "#14B614",
  };

  const position = useComponentValue(LocalPosition, entity) ?? { x: 0, y: 0 };
  const terrainAtPosition = useEntityQuery([Has(TerrainType), HasValue(LocalPosition, position)])[0] ?? BYTES32_ZERO;
  const terrainType = getComponentValue(TerrainType, terrainAtPosition)?.value ?? 0;
  const armorModifier = getComponentValue(ArmorModifier, terrainAtPosition)?.value ?? 0;

  const unitType = getComponentValue(UnitType, entity)?.value ?? 0;

  const combatData = useComponentValue(Combat, entity);
  const onCooldown = Boolean(useComponentValue(OnCooldown, entity)?.value);

  const chargeCap = useComponentValue(ChargeCap, entity);
  const charger = getComponentValue(Charger, entity);

  const hasGold = combatData && charger && chargeCap && chargeCap.totalCharged !== chargeCap.cap;

  return (
    <Card className="flex p-2 gap-x-2">
      <EntityPortrait entity={entity} />

      <div className="flex flex-col gap-y-2">
        {combatData && (
          <Bar
            backgroundColor="#FFFFFF"
            backgroundColorShadow="#DBDBDB"
            color={healthBarColors.main}
            colorShadow={healthBarColors.shadow}
            widthPercent={(combatData.health / combatData.maxHealth) * 100}
            label={`${((combatData.health / combatData.maxHealth) * 100).toFixed(0)}%`}
            labelColor="#000000"
          />
        )}

        {!combatData && (
          <Bar
            backgroundColor="#B3B3B3"
            backgroundColorShadow="#757575"
            color="#E6194B"
            colorShadow="#A11135"
            widthPercent={0}
            label="Depleted"
            labelColor="#25241D"
          />
        )}

        {Boolean(unitType) && (
          <Bar
            backgroundColor="#B3B3B3"
            backgroundColorShadow="#757575"
            color={onCooldown ? "#B3B3B3" : "#8CBEEF"}
            colorShadow="#4797E5"
            widthPercent={onCooldown ? 0 : 100}
            label={onCooldown ? "Exhausted" : "Ready"}
            labelColor={onCooldown ? "#5D5D4C" : "#25241D"}
          />
        )}

        {hasGold && (
          <Bar
            backgroundColor="#FFFFFF"
            backgroundColorShadow="#DBDBDB"
            color="#FFD34B"
            colorShadow="#E5AD00"
            widthPercent={((chargeCap.cap - chargeCap.totalCharged) / chargeCap.cap) * 100}
            label={`${chargeCap.cap - chargeCap.totalCharged}g`}
            labelColor="#25241D"
          />
        )}

        {combatData && hasGold && (
          <div className="flex align-items-center justify-between mt-1">
            <div className="w-4 h-4 scale-75 -translate-y-1 -translate-x-1">
              <SpriteImage spriteKey={Sprites.Gold} scale={1.2} />
            </div>

            <div className="text-black font-medium text-[14px]">{charger.value}g/turn</div>
          </div>
        )}

        {Boolean(unitType) && (
          <>
            <div className="w-full flex justify-between items-center">
              <TerrainTypeImage terrain={terrainType} />
              <ArmorModifierImage modifier={armorModifier} />
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
