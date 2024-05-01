import { tileCoordToPixelCoord } from "phaserx";
import { ZERO_VECTOR } from "phaserx";
import {
  Has,
  getComponentValueStrict,
  defineEnterSystem,
  runQuery,
  HasValue,
  getEntitiesWithValue,
  hasComponent,
  Entity,
} from "@latticexyz/recs";
import { isArray, sample } from "lodash";
import { TerrainTypes } from "../../../../Network";
import { Animations, Assets } from "../../phaserConstants";
import { Tileset, WangSetKey, WangSets, TileAnimationKey } from "../../tilesets/overworld";
import { PhaserLayer, RenderDepth } from "../../types";

type Coord = { x: number; y: number; z?: number };

export function addCoords(a: Coord, b: Coord) {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}

export const terrainTypeToTile = {
  [TerrainTypes.Grass]: [
    Tileset.Grass1,
    Tileset.Grass1,
    Tileset.Grass1,
    Tileset.Grass1,
    Tileset.Grass2,
    Tileset.Grass3,
  ],
  [TerrainTypes.Mountain]: Tileset.Grass2,
  [TerrainTypes.Forest]: Tileset.Grass2,
} as { [key in TerrainTypes]: Tileset | Tileset[] };

const terrainTypesToForegroundTile = {
  [TerrainTypes.Grass]: [
    Tileset.Flower1,
    Tileset.Flower2,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ],

  [TerrainTypes.Forest]: Tileset.Forest,
  [TerrainTypes.Mountain]: Tileset.Mountain,
} as { [key in TerrainTypes]: Tileset | (Tileset | null)[] };

const terrainTypeToAnimation = {
  // [TerrainTypes.Grass]: [TileAnimationKey.LongGrassBackground, null, null, null, null],
} as { [key in TerrainTypes]: TileAnimationKey | (TileAnimationKey | null)[] };

const terrainTypeToForegroundAnimation = {} as { [key in TerrainTypes]: Animations };

const terrainTypeToWangSet = {} as { [key in TerrainTypes]: WangSetKey };

/**
 * The Map system handles rendering the phaser tilemap
 */
export function createMapSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { Position, TerrainType, MatchReady },
        network: { matchEntity },
      },
      headless: {
        components: { InCurrentMatch },
      },
    },
    scenes: {
      Main: {
        config,
        maps: { Main },
      },
    },
    globalObjectPool,
  } = layer;

  // TODO: commented till we fix the uploader to bundle untraversable and entity type together
  // defineEnterSystem(world, [Has(Position), Not(TerrainType)], (update) => {
  // const coord = getComponentValueStrict(Position, update.entity);
  // Main.putTileAt(coord, Tileset.Plain);
  // });
  //
  const WANG_OFFSET = [
    { x: 0, y: -1 },
    { x: 1, y: -1 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
    { x: -1, y: 1 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
  ];

  function calculateWangId(coord: Coord, entityType: TerrainTypes) {
    const bits = [];
    for (const offset of WANG_OFFSET) {
      const checkCoord = addCoords(coord, offset);
      const entities = runQuery([HasValue(Position, checkCoord), HasValue(TerrainType, { value: entityType })]);
      if (entities.size > 0) {
        bits.push(1);
      } else {
        bits.push(0);
      }
    }

    // turn the bitstring into a decimal number (with MSB on the right!)
    // ignore "corner" bits if their neighbors are not set
    // corner bits are bits [1,3,5,7]
    // 7 | 0 | 1
    // 6 | x | 2
    // 5 | 4 | 3
    return bits.reduce((acc, b, i, arr) => {
      if (i % 2 === 0) {
        return acc + Math.pow(2, i) * b;
      } else {
        const before = (i - 1) % 8;
        const after = (i + 1) % 8;
        if (arr[before] && arr[after]) {
          return acc + Math.pow(2, i) * b;
        } else {
          return acc;
        }
      }
    });
  }

  function getWangSet(entityType: TerrainTypes) {
    const wangSetKey = terrainTypeToWangSet[entityType];
    if (!wangSetKey) return;
    return WangSets[wangSetKey];
  }

  function drawWangSetAtCoord(coord: Coord, entityType: TerrainTypes) {
    const wangSet = getWangSet(entityType);
    if (!wangSet) return;
    // redraw itself then all neighbors
    for (const offset of [ZERO_VECTOR, ...WANG_OFFSET]) {
      // is this tile an entity of type entityType?
      const coordToRedraw = addCoords(coord, offset);
      const entities = runQuery([HasValue(Position, coordToRedraw), HasValue(TerrainType, { value: entityType })]);
      if (entities.size === 0) continue;
      const wangId = calculateWangId(coordToRedraw, entityType);
      if (wangSet[wangId] == null) continue;
      Main.putTileAt(coordToRedraw, wangSet[wangId], "Foreground");
    }
  }

  const drawIslandDepth = (entity: Entity, tileWidth: number, tileHeight: number) => {
    const coord = getComponentValueStrict(Position, entity);
    const pixelCoord = tileCoordToPixelCoord(coord, tileWidth, tileHeight);

    for (const asset in Assets) {
      globalObjectPool.remove(`depth-${coord.x}-${coord.y}-${asset}`);
    }

    const addAsset = (asset: Assets, offset: Coord) => {
      const result = addCoords(pixelCoord, offset);

      const obj = globalObjectPool.get(`depth-${coord.x}-${coord.y}-${asset}`, "Sprite");
      const sprite = config.assets[asset];
      obj.setTexture(sprite.key, 0);
      obj.setPosition(result.x, result.y);
      obj.setDepth(RenderDepth.Background4);
    };

    const empties = WANG_OFFSET.map((offset) =>
      [...getEntitiesWithValue(Position, addCoords(coord, offset))].every(
        (entity) => !hasComponent(TerrainType, entity),
      ),
    );

    const upEmpty = empties[0];
    const topRightEmpty = empties[1];
    const rightEmpty = empties[2];
    const downEmpty = empties[4];
    const leftEmpty = empties[6];
    const topLeftEmpty = empties[7];

    if (upEmpty) {
      addAsset(Assets.UpperEdge, { x: 0, y: -tileWidth });
    }

    if (downEmpty) {
      if (leftEmpty || rightEmpty) {
        if (leftEmpty) {
          addAsset(Assets.LeftCornerUpA, { x: 0, y: tileWidth });
        } else {
          addAsset(Assets.RightCornerUpA, { x: 0, y: tileWidth });
        }
      } else {
        const farEmpties = [
          { x: -2, y: 0 },
          { x: 2, y: 0 },
        ].map((offset) =>
          [...getEntitiesWithValue(Position, addCoords(coord, offset))].every(
            (entity) => !hasComponent(TerrainType, entity),
          ),
        );
        const farLeftEmpty = farEmpties[0];
        const farRightEmpty = farEmpties[1];

        if (farLeftEmpty || farRightEmpty) {
          if (farLeftEmpty) {
            addAsset(Assets.LeftCornerUpB, { x: 0, y: tileWidth });
          } else {
            addAsset(Assets.RightCornerUpB, { x: 0, y: tileWidth });
          }
        } else {
          addAsset(Assets.Central, { x: 0, y: tileWidth });
        }
      }
    }

    if (leftEmpty) {
      addAsset(Assets.LeftEdge, { x: -tileWidth, y: 0 });

      if (topLeftEmpty) {
        addAsset(Assets.UpperEdgeLeft, { x: -tileWidth, y: -tileWidth });
      }
    }
    if (rightEmpty) {
      addAsset(Assets.RightEdge, { x: tileWidth, y: 0 });

      if (topRightEmpty) {
        addAsset(Assets.UpperEdgeRight, { x: tileWidth, y: -tileWidth });
      }
    }
  };

  defineEnterSystem(world, [Has(MatchReady)], ({ entity }) => {
    if (entity != matchEntity) return;

    let foregroundAnimationTileIndex = 0;
    defineEnterSystem(
      world,
      [Has(InCurrentMatch), Has(Position), Has(TerrainType)],
      (update) => {
        const coord = getComponentValueStrict(Position, update.entity);
        const { tileWidth, tileHeight } = Main;
        const pixelCoord = tileCoordToPixelCoord(coord, tileWidth, tileHeight);

        const type = getComponentValueStrict(TerrainType, update.entity);
        const tile = terrainTypeToTile[type.value as TerrainTypes];
        const foregroundTile = terrainTypesToForegroundTile[type.value as TerrainTypes];

        const animation = terrainTypeToAnimation[type.value as TerrainTypes];
        if (tile == undefined) return;
        if (animation) {
          const anim = isArray(animation) ? sample(animation) : animation;
          if (anim) {
            Main.putAnimationAt(coord, anim);

            const foregroundAnimation = terrainTypeToForegroundAnimation[type.value as TerrainTypes];
            if (foregroundAnimation) {
              // Main.putAnimationAt(coord, anim, "Foreground");
              const sprite = globalObjectPool.get(
                `terrain-foreground-animation-${foregroundAnimationTileIndex++}`,
                "Sprite",
              );
              sprite.play(foregroundAnimation);
              sprite.setPosition(pixelCoord.x, pixelCoord.y);
              sprite.setDepth(RenderDepth.Foreground1);
            }
          }
        }

        let tint: number | undefined;
        const backgroundTile = isArray(tile) ? sample(tile) : tile;
        if (!backgroundTile) return;
        Main.putTileAt(coord, backgroundTile, undefined, tint);

        drawIslandDepth(update.entity, tileWidth, tileHeight);

        if (foregroundTile) {
          const t = isArray(foregroundTile) ? sample(foregroundTile) : foregroundTile;
          if (!t) return;

          Main.putTileAt(coord, t, "Foreground");
        }
        drawWangSetAtCoord(coord, type.value);
      },
      { runOnInit: true },
    );
  });
}
