import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { Button } from "../ui/Theme/SkyStrife/Button";
import { Modal } from "./Modal";
import * as Dialog from "@radix-ui/react-dialog";
import { useAmalgema } from "../../useAmalgema";
import { Entity, HasValue } from "@latticexyz/recs";
import { UnitTypes } from "../../layers/Network";
import { UnitTypeSprites } from "../../layers/Renderer/Phaser/phaserConstants";
import { SpriteImage } from "../ui/Theme/SpriteImage";
import { Hex } from "viem";
import { twMerge } from "tailwind-merge";
import { SeasonPassIcon } from "./SeasonPassIcon";
import { UnitTypeDescriptions, UnitTypeNames } from "../../layers/Network/types";
import { useSeasonPassExternalWallet } from "./hooks/useSeasonPass";
import { Tooltip } from "react-tooltip";
import { OverlineSmall } from "../ui/Theme/SkyStrife/Typography";
import { uniq } from "lodash";

const UnitTypeStatBars = {
  [UnitTypes.Halberdier]: {
    health: {
      percent: 100,
      color: "#00ff00",
    },
    armor: {
      percent: 100,
      color: "#00ff00",
    },
    strength: {
      percent: 50,
      color: "#ff8000",
    },
    movement: {
      percent: 25,
      color: "#ff0000",
    },
  },
  [UnitTypes.Dragoon]: {
    health: {
      percent: 75,
      color: "#ffff00",
    },
    armor: {
      percent: 50,
      color: "#ff8000",
    },
    strength: {
      percent: 75,
      color: "#ffff00",
    },
    movement: {
      percent: 100,
      color: "#00ff00",
    },
  },
  [UnitTypes.Marksman]: {
    health: {
      percent: 50,
      color: "#ff8000",
    },
    armor: {
      percent: 25,
      color: "#ff0000",
    },
    strength: {
      percent: 75,
      color: "#ffff00",
    },
    movement: {
      percent: 75,
      color: "#ffff00",
    },
  },
} as Record<UnitTypes, Record<"health" | "armor" | "strength" | "movement", { percent: number; color: string }>>;

function StatBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="w-[54px] h-2 bg-white border border-ss-stroke rounded-md">
      <div style={{ backgroundColor: color, width: `${percent}%` }} className="h-full rounded-md" />
    </div>
  );
}

function HeroPreview({
  heroEntity,
  setHero,
  selected,
}: {
  heroEntity: Entity;
  selected: boolean;
  setHero: (hero: Hex) => void;
}) {
  const {
    components: { UnitType, HeroInSeasonPassRotation },
    utils: { getTemplateValueStrict },
  } = useAmalgema();

  const seasonPassOnly = useComponentValue(HeroInSeasonPassRotation, heroEntity)?.value;
  const hasSeasonPass = useSeasonPassExternalWallet();

  const unitType = getTemplateValueStrict(UnitType.id as Hex, heroEntity as Hex).value as UnitTypes;
  const name = UnitTypeNames[unitType];
  const heroDescription = UnitTypeDescriptions[unitType];
  const sprite = UnitTypeSprites[unitType];

  const stats = UnitTypeStatBars[unitType];

  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center">
        <div className="flex items-center space-x-2 ">
          {seasonPassOnly && <SeasonPassIcon />} <span>{name}</span>
        </div>
        <div className="text-ss-text-x-light text-[14px]">{heroDescription}</div>
      </div>

      <div className="h-3" />

      <div
        className={twMerge(
          "flex flex-col rounded-md shadow-ss-small border border-black w-full",
          selected ? "bg-ss-bg-0" : "bg-ss-bg-1",
        )}
      >
        <div className="bg-ss-bg-2 w-full flex flex-col items-center rounded-t-md">
          <div className="h-4" />

          <SpriteImage spriteKey={sprite} colorName="blue" scale={2} />

          <div className="h-4" />
        </div>

        <div className="p-4">
          <div className="text-ss-text-light underline flex items-center">
            health <div className="grow" /> <StatBar percent={stats.health.percent} color={stats.health.color} />
          </div>

          <div className="text-ss-text-light underline flex items-center">
            armor <div className="grow" /> <StatBar percent={stats.armor.percent} color={stats.armor.color} />
          </div>

          <div className="text-ss-text-light underline flex items-center">
            strength <div className="grow" /> <StatBar percent={stats.strength.percent} color={stats.strength.color} />
          </div>

          <div className="text-ss-text-light underline flex items-center">
            movement <div className="w-2 grow" />{" "}
            <StatBar percent={stats.movement.percent} color={stats.movement.color} />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="h-4 w-full border-t-2" />

          <Button
            data-tooltip-id={`season-pass-hero-${heroEntity}`}
            disabled={selected || (seasonPassOnly && !hasSeasonPass)}
            buttonType="primary"
            onClick={() => setHero(heroEntity as Hex)}
          >
            {selected ? "Selected" : "Select"}
          </Button>

          {seasonPassOnly && !hasSeasonPass && (
            <Tooltip
              id={`season-pass-hero-${heroEntity}`}
              variant="light"
              place="top"
              opacity={1}
              render={() => {
                return <div className="w-[120px]">This hero requires a Season Pass to access this week.</div>;
              }}
            />
          )}

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}

export function HeroModal({
  hero,
  setHero,
  footer,
  trigger,
}: {
  hero: Hex;
  setHero: (hero: Hex) => void;
  footer: React.ReactNode;
  trigger?: React.ReactNode;
}) {
  const {
    components: { HeroInRotation, HeroInSeasonPassRotation, UnitType },
    utils: { getTemplateValueStrict },
  } = useAmalgema();

  const freeHeroes = useEntityQuery([HasValue(HeroInRotation, { value: true })]);
  const seasonPassHeroes = useEntityQuery([HasValue(HeroInSeasonPassRotation, { value: true })]);

  const allHeroes = uniq([...freeHeroes, ...seasonPassHeroes]);

  return (
    <Modal title="select a hero" footer={footer} trigger={trigger || <Button buttonType="primary">switch hero</Button>}>
      <div className="w-full">
        <div className="flex justify-around space-x-6">
          {allHeroes.map((heroEntity, i) => {
            return (
              <HeroPreview
                key={`${heroEntity}-${i}`}
                heroEntity={heroEntity}
                setHero={setHero}
                selected={(heroEntity as Hex) === hero}
              />
            );
          })}
        </div>

        <div className="h-3" />
      </div>
    </Modal>
  );
}

export function HeroSelect({ hero, setHero }: { hero: Hex; setHero: (hero: Hex) => void }) {
  const {
    components: { UnitType },
    utils: { getTemplateValueStrict },
  } = useAmalgema();

  const unitType = getTemplateValueStrict(UnitType.id as Hex, hero as Hex).value as UnitTypes;
  const description = UnitTypeDescriptions[unitType];
  const name = UnitTypeNames[unitType];
  const sprite = UnitTypeSprites[unitType];

  return (
    <div>
      <OverlineSmall>select a hero</OverlineSmall>

      <div className="flex space-x-4">
        <div className="flex items-center rounded grow bg-white p-3 space-x-1">
          <SpriteImage spriteKey={sprite} colorName="blue" scale={2} />
          <div>
            <div className="text-lg">{name}</div>
            <div className="text-ss-text-x-light">{description}</div>
          </div>
        </div>
        <HeroModal
          hero={hero}
          setHero={setHero}
          footer={
            <Dialog.Close asChild>
              <Button className="w-full" buttonType="primary">
                Confirm
              </Button>
            </Dialog.Close>
          }
        />
      </div>
    </div>
  );
}
