import { useEntityQuery } from "@latticexyz/react";
import { Has } from "@latticexyz/recs";
import { useAmalgema } from "../../../useAmalgema";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { Coord, range } from "@latticexyz/utils";
import { Hex } from "viem";

const transparent = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

export const DisplayLevel = ({ level }: { level: Hex }) => {
  const {
    network: {
      components: { LevelPosition },
    },
    utils: { getLevelPositionStrict },
  } = useAmalgema();

  const positions = useEntityQuery([Has(LevelPosition)])
    .map((key) => decodeEntity(LevelPosition.metadata.keySchema, key))
    .filter(({ levelId }) => {
      return levelId === level;
    })
    .map(({ index }) => getLevelPositionStrict(level, index)) as Coord[];

  const xMin = Math.min(...positions.map((o) => o.x));
  const xMax = Math.max(...positions.map((o) => o.x));
  const yMin = Math.min(...positions.map((o) => o.y));
  const yMax = Math.max(...positions.map((o) => o.y));

  const max = Math.max(xMax, yMax);
  const min = Math.min(xMin, yMin);

  return (
    <div className="bg-blue-300">
      <table>
        <tbody>
          {Array.from(range(max - min + 3, 1, min - 1)).map((j) => (
            <tr key={j}>
              {Array.from(range(max - min + 3, 1, min - 1)).map((i) => (
                <td key={`${i},${j}`} className="p-0">
                  {positions.some(({ x, y }) => x === i && y === j) ? (
                    <img src="./assets/grass.png" width="20" />
                  ) : (
                    <img src={transparent} width="20" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
