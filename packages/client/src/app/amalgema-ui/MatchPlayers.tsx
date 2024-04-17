import { Entity, getComponentValue, hasComponent } from "@latticexyz/recs";
import { useAmalgema } from "../../useAmalgema";
import { Body } from "../ui/Theme/SkyStrife/Typography";
import { twMerge } from "tailwind-merge";
import { DisplayNameWithLink } from "./CreatedBy";
import { Tooltip } from "react-tooltip";
import { encodeEntity } from "@latticexyz/store-sync/recs";
import { Hex } from "viem";
import { useComponentValue } from "@latticexyz/react";
import { encodeMatchEntity } from "../../encodeMatchEntity";

export function MatchPlayers({ matchEntity }: { matchEntity: Entity }) {
  const {
    components: { MatchConfig, SpawnReservedBy, CreatedByAddress },
    utils: { getLevelSpawns },
  } = useAmalgema();

  const config = useComponentValue(MatchConfig, matchEntity);

  const spawns = config ? getLevelSpawns(config.levelId) : [];

  return (
    <div data-tooltip-id={`match-players-tooltip-${matchEntity}`} className="flex flex-row w-full group">
      {spawns.map((index, i) => {
        const spawnReserved = hasComponent(
          SpawnReservedBy,
          encodeEntity(SpawnReservedBy.metadata.keySchema, { matchEntity: matchEntity as Hex, index }),
        );

        return (
          <div
            key={`spawn-${i}`}
            className={twMerge(
              "h-[24px] w-full border border-ss-white",
              spawnReserved ? "bg-ss-blue" : "bg-ss-bg-0",
              i === 0 ? "rounded-l-md" : i === spawns.length - 1 ? "rounded-r-md" : "",
            )}
          >
            {spawnReserved && (
              <Body className="w-full h-full flex flex-col items-center justify-around text-ss-text-default">
                P{i + 1}
              </Body>
            )}
          </div>
        );
      })}

      <Tooltip
        id={`match-players-tooltip-${matchEntity}`}
        variant="light"
        place="top"
        opacity={1}
        render={() => {
          return (
            <div className="w-[120px]">
              {spawns.map((index, i) => {
                const spawnReservedBy = getComponentValue(
                  SpawnReservedBy,
                  encodeEntity(SpawnReservedBy.metadata.keySchema, { matchEntity: matchEntity as Hex, index }),
                );

                if (!spawnReservedBy) {
                  return (
                    <div key={`spawn-${i}`} className="flex justify-between">
                      <div>P{i + 1}</div>
                      <div>empty</div>
                    </div>
                  );
                }

                const player = encodeMatchEntity(matchEntity, spawnReservedBy.value);
                const owner = getComponentValue(CreatedByAddress, player as Entity);

                return (
                  <div key={`spawn-${i}`} className="flex justify-between">
                    <div>P{i + 1}</div>
                    <div>{owner ? <DisplayNameWithLink entity={owner.value as Entity} /> : "empty"}</div>
                  </div>
                );
              })}
            </div>
          );
        }}
      />
    </div>
  );
}
