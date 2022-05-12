import { Type, World, defineComponent } from "@latticexyz/recs";

export function defineLocalPositionComponent(world: World) {
  return defineComponent(world, { x: Type.Number, y: Type.Number }, { id: "LocalPosition", indexed: true });
}
