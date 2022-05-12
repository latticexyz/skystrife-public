import {
  Entity,
  Has,
  HasValue,
  UpdateType,
  defineEnterSystem,
  defineSystem,
  getComponentValueStrict,
  removeComponent,
  setComponent,
} from "@latticexyz/recs";
import { HeadlessLayer } from "../..";
import { TerrainTypes } from "../../../Network";
import { stringToHex } from "viem";

export function createScopeClientToMatchSystem(layer: HeadlessLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components,
        components: { Match, MatchConfig, TerrainType },
        network: { matchEntity },
        utils: { getVirtualLevelData },
      },
    },
    components: { InCurrentMatch },
  } = layer;

  if (!matchEntity) return;

  defineSystem(world, [HasValue(Match, { matchEntity })], ({ entity, type }) => {
    if (type === UpdateType.Exit) {
      removeComponent(InCurrentMatch, entity);
    } else {
      setComponent(InCurrentMatch, entity, { value: true });
    }
  });

  defineEnterSystem(world, [Has(MatchConfig)], ({ entity }) => {
    if (entity != matchEntity) return;

    const { levelId } = getComponentValueStrict(MatchConfig, entity);

    const data = getVirtualLevelData(levelId as Entity);

    // Create client-side entities for virtual templates
    data.forEach((datum, i) => {
      const datumEntity = stringToHex(`levelIndex:${i}`, { size: 32 }) as Entity;
      const { TerrainType: terrainType, ...componentsByName } = datum;

      setComponent(TerrainType, datumEntity, {
        value: TerrainTypes[TerrainTypes[datum.TerrainType.value]] as never,
      });
      for (const [componentName, data] of Object.entries(componentsByName)) {
        setComponent(components[componentName], datumEntity, data);
      }
      setComponent(InCurrentMatch, datumEntity, { value: true });
    });
  });
}
