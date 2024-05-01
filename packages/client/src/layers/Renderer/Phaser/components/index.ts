import { defineComponent, Type, World } from "@latticexyz/recs";
import { defineAppearanceComponent } from "./Appearance";
import { defineHueTintComponent } from "./HueTint";
import { defineOutlineComponent } from "./Outline";
import { defineSpriteAnimationComponent } from "./SpriteAnimation";

export function createPhaserComponents(world: World) {
  const Appearance = defineAppearanceComponent(world);
  const SpriteAnimation = defineSpriteAnimationComponent(world);
  const Outline = defineOutlineComponent(world);
  const HueTint = defineHueTintComponent(world);
  const HoverHighlight = defineComponent(world, { x: Type.Number, y: Type.Number }, { id: "HoverHighlight" });
  const PreviousHoverHighlight = defineComponent(
    world,
    { x: Type.Number, y: Type.Number },
    { id: "PreviousHoverHighlight" },
  );
  const HoverIcon = defineComponent(world, { icon: Type.String }, { id: "HoverIcon" });
  const Alpha = defineComponent(world, { icon: Type.Number }, { id: "Alpha" });
  const MapBounds = defineComponent(world, {
    top: Type.Number,
    right: Type.Number,
    bottom: Type.Number,
    left: Type.Number,
  });
  const HeaderHeight = defineComponent(world, { value: Type.Number }, { id: "HeaderHeight" });
  const DevHighlight = defineComponent(world, { value: Type.OptionalNumber }, { id: "DevHighlight" });
  const TerrainArmorBonus = defineComponent(world, { value: Type.Number }, { id: "TerrainArmorBonus" });
  const WillBeDestroyed = defineComponent(world, { value: Type.Boolean }, { id: "WillBeDestroyed" });

  return {
    Appearance,
    SpriteAnimation,
    Outline,
    HueTint,
    DevHighlight,
    HoverHighlight,
    PreviousHoverHighlight,
    HoverIcon,
    Alpha,
    MapBounds,
    HeaderHeight,
    TerrainArmorBonus,
    WillBeDestroyed,
  };
}
