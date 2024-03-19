import { Body, OverlineSmall } from "../Theme/SkyStrife/Typography";
import { Mana } from "../Theme/SkyStrife/Mana";
import { Entity } from "@latticexyz/recs";
import { Fragment } from "react";
import { useAmalgema } from "../../../useAmalgema";

export function MatchRewards({ matchEntity }: { matchEntity: Entity }) {
  const {
    utils: { getMatchRewards },
  } = useAmalgema();

  const matchRewards = getMatchRewards(matchEntity).totalRewards;
  if (matchRewards.length === 0) return <></>;

  return (
    <div className="w-[500px] p-8 pt-4 space-y-4">
      <OverlineSmall>reward pool</OverlineSmall>

      <div className="space-y-2">
        {matchRewards.map((reward, i) => {
          if (reward.value === 0n) return <Fragment key={i}></Fragment>;

          const place = i + 1;
          let rankName = "th";
          if (place === 1) {
            rankName = "st";
          } else if (place === 2) {
            rankName = "nd";
          } else if (place === 3) {
            rankName = "rd";
          }

          return (
            <div key={i}>
              <div className="flex flex-row justify-between items-center">
                <Body className="text-ss-default">
                  {i + 1}
                  {rankName} Place
                </Body>
                <Mana amount={reward.value || 0n} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
