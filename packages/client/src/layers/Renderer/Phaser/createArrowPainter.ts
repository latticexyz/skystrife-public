import { createPhaserEngine, tileCoordToPixelCoord } from "phaserx";
import { WorldCoord } from "phaserx/src/types";
import { TILE_HEIGHT, TILE_WIDTH } from "./phaserConstants";
import { RenderDepth } from "./types";

// Direction codes
// 7 | 0 | 1
// 6 | x | 2
// 5 | 4 | 3
export const createArrowPainter = (scene: Awaited<ReturnType<typeof createPhaserEngine>>["scenes"]["Main"]) => {
  const arrowCodeFromPoints = (behind: WorldCoord | undefined, middle: WorldCoord, front: WorldCoord | undefined) => {
    if (!behind && !front) {
      // this is not an arrow
      return "-1";
    }

    let behindDirectionCode: number | undefined;
    const behindXDiff = behind ? behind.x - middle.x : 0;
    const behindYDiff = behind ? behind.y - middle.y : 0;

    if (behindXDiff === 0 && behindYDiff === -1) {
      behindDirectionCode = 0;
    } else if (behindXDiff === 1 && behindYDiff === -1) {
      behindDirectionCode = 1;
    } else if (behindXDiff === 1 && behindYDiff === 0) {
      behindDirectionCode = 2;
    } else if (behindXDiff === 1 && behindYDiff === 1) {
      behindDirectionCode = 3;
    } else if (behindXDiff === 0 && behindYDiff === 1) {
      behindDirectionCode = 4;
    } else if (behindXDiff === -1 && behindYDiff === 1) {
      behindDirectionCode = 5;
    } else if (behindXDiff === -1 && behindYDiff === 0) {
      behindDirectionCode = 6;
    } else if (behindXDiff === -1 && behindYDiff === -1) {
      behindDirectionCode = 7;
    }

    let frontDirectionCode: number | undefined;
    const frontXDiff = front ? front.x - middle.x : 0;
    const frontYDiff = front ? front.y - middle.y : 0;

    if (frontXDiff === 0 && frontYDiff === -1) {
      frontDirectionCode = 0;
    } else if (frontXDiff === 1 && frontYDiff === -1) {
      frontDirectionCode = 1;
    } else if (frontXDiff === 1 && frontYDiff === 0) {
      frontDirectionCode = 2;
    } else if (frontXDiff === 1 && frontYDiff === 1) {
      frontDirectionCode = 3;
    } else if (frontXDiff === 0 && frontYDiff === 1) {
      frontDirectionCode = 4;
    } else if (frontXDiff === -1 && frontYDiff === 1) {
      frontDirectionCode = 5;
    } else if (frontXDiff === -1 && frontYDiff === 0) {
      frontDirectionCode = 6;
    } else if (frontXDiff === -1 && frontYDiff === -1) {
      frontDirectionCode = 7;
    }

    if (behindDirectionCode === undefined && frontDirectionCode !== undefined) {
      return `${frontDirectionCode}-start`;
    }

    if (behindDirectionCode !== undefined && frontDirectionCode === undefined) {
      return `${behindDirectionCode}-end`;
    }

    return [behindDirectionCode, frontDirectionCode]
      .filter((c) => c != undefined)
      .sort()
      .join("");
  };

  const pathToArrowCodes = (path: WorldCoord[]) => {
    const arrowCodes: string[] = [];

    for (let i = 0; i < path.length; i++) {
      const behind = path[i - 1];
      const middle = path[i];
      const front = path[i + 1];

      const arrowCode = arrowCodeFromPoints(behind, middle, front);
      arrowCodes.push(arrowCode);
    }

    return arrowCodes;
  };

  const paintArrowAlongPath = (arrowType: "Attack" | "Move", path: WorldCoord[]) => {
    const arrowCodes = pathToArrowCodes(path).filter((arrowCode) => arrowCode !== "-1");
    if (arrowCodes.length < 2) return;

    const spriteKeys = arrowCodes.map((arrowCode) => {
      const key = `Arrow${arrowType}-${arrowCode}`;
      return key;
    });
    const paintedSpriteGroup = scene.phaserScene.add.group();

    for (let i = 0; i < spriteKeys.length; i++) {
      const coord = path[i];
      const pixelCoord = tileCoordToPixelCoord(coord, TILE_WIDTH, TILE_HEIGHT);
      const spriteObj = scene.phaserScene.add.sprite(pixelCoord.x, pixelCoord.y, "");
      const spriteConfig = scene.config.sprites[spriteKeys[i]];
      spriteObj.setTexture(spriteConfig.assetKey, spriteConfig.frame);
      spriteObj.setDepth(RenderDepth.Foreground5);

      const size = spriteObj.width * spriteObj.scaleX;
      const newOrigin = (size - TILE_WIDTH) / (2 * size);
      spriteObj.setOrigin(newOrigin);

      paintedSpriteGroup.add(spriteObj);
    }

    return paintedSpriteGroup;
  };

  return {
    arrowCodeFromPoints,
    pathToArrowCodes,
    paintArrowAlongPath,
  };
};

// const arrowPainter = createArrowPainter();

// tests
// console.log(arrowPainter.arrowCodeFromPoints({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }), "04");
// console.log(arrowPainter.arrowCodeFromPoints({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }), "26");
// console.log(arrowPainter.arrowCodeFromPoints({ x: 0, y: 0 }, { x: 1, y: 0 }, undefined), "6-end");

// console.log(arrowPainter.pathToArrowCodes([{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }]), ["4-start", "04", "0-end"]);
// console.log(arrowPainter.pathToArrowCodes([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }]), ["2-start", "26", "6-end"]);
