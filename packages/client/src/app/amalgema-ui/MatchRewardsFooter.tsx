import { Mana } from "../ui/Theme/SkyStrife/Mana";
import { Caption } from "../ui/Theme/SkyStrife/Typography";
import { Tooltip } from "react-tooltip";
import { Entity } from "@latticexyz/recs";
import { useComponentValue } from "@latticexyz/react";
import { useAmalgema } from "../../useAmalgema";

// from https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number
export function ordinalSuffix(i: number) {
  const j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
}

/**
 * Designed to be rendered at the bottom of a Card component.
 */
export function MatchRewardsFooter({ matchEntity }: { matchEntity: Entity }) {
  const {
    network: {
      components: { MatchSweepstake },
    },
    utils: { getMatchRewards },
  } = useAmalgema();

  const sweepstake = useComponentValue(MatchSweepstake, matchEntity);
  const matchRewards = getMatchRewards(matchEntity);
  const totalReward = matchRewards.totalRewards.reduce((acc, reward) => acc + reward.value, 0n);

  return (
    <div
      style={{
        marginLeft: "-24px",
        marginBottom: "-16px",
        width: "calc(100% + 48px)",
        borderRadius: "0 0 8px 8px",
      }}
      className="bg-ss-bg-0 border-t border-ss-stroke px-6 py-4"
    >
      <div className="flex flex-row justify-between items-center group">
        <Caption>Reward pool</Caption>
        <div data-tooltip-id={`match-rewards-tooltip-${matchEntity}`}>
          <Mana
            style={{
              borderBottom: "2px dotted #000",
              lineHeight: "20px",
            }}
            amount={totalReward}
          />
        </div>

        <Tooltip
          id={`match-rewards-tooltip-${matchEntity}`}
          variant="light"
          opacity={1}
          render={() => {
            return (
              <>
                {matchRewards.totalRewards.map((reward, i) => (
                  <div key={i} className="flex flex-row justify-between items-center">
                    <Caption>{ordinalSuffix(i + 1)} place</Caption>
                    <Mana amount={reward.value} />
                  </div>
                ))}
              </>
            );
          }}
        />
      </div>

      <div className="flex flex-row justify-between items-center group">
        <Caption>Entrance fee</Caption>
        <div>
          <Mana
            style={{
              lineHeight: "20px",
            }}
            amount={sweepstake ? sweepstake.entranceFee : 0n}
          />
        </div>
      </div>
    </div>
  );
}
