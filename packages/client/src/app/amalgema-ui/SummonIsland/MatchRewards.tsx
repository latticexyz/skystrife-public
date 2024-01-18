import { Hex, padHex } from "viem";
import { Body, OverlineSmall } from "../../ui/Theme/SkyStrife/Typography";
import { OrbInput, PercentageInput } from "./common";
import { useAmalgema } from "../../../useAmalgema";
import { twMerge } from "tailwind-merge";
import { ordinalSuffix } from "../MatchRewardsFooter";
import { useCurrentMatchReward } from "../hooks/useCurrentMatchReward";
import { useComponentValue } from "@latticexyz/react";
import { Entity } from "@latticexyz/recs";

function Row({ children }: { children: React.ReactNode }) {
  return <div className="w-full flex flex-row items-center space-x-4 space-y-3">{children}</div>;
}

export function MatchRewards({
  entranceFee,
  rewardPercentages,
  setRewardPercentages,
  levelId,
}: {
  levelId: Hex;
  entranceFee: bigint;
  rewardPercentages: bigint[];
  setRewardPercentages: (rewardPercentages: bigint[]) => void;
}) {
  const {
    components: { MatchRewardPercentages },
    utils: { getLevelSpawns },
  } = useAmalgema();

  const numPlayers = getLevelSpawns(levelId).length;
  const totalFees = BigInt(numPlayers) * entranceFee;
  const creatorReward = rewardPercentages[rewardPercentages.length - 1] ?? 0n;

  const currentDefaultMatchReward = useCurrentMatchReward();
  const defaultRewardPercentages =
    useComponentValue(MatchRewardPercentages, padHex(numPlayers.toString(16) as Hex, { size: 32 }) as Entity)
      ?.percentages ?? [];
  const totalPercentage = rewardPercentages.reduce((a, b) => a + b, 0n);

  let error = "";
  if (totalPercentage > 100) {
    error = "Total percentage cannot exceed 100%";
  } else if (totalPercentage < 100) {
    error = "Total percentage must be 100%";
  }

  if (entranceFee === 0n) {
    return (
      <div>
        <OverlineSmall>Match rewards</OverlineSmall>
        <Body className="text-ss-text-default">
          The rewards for the top players in your match. This varies depending on the how many matches were created in
          the past 7 days.
        </Body>

        <div className="h-6" />

        {defaultRewardPercentages.slice(0, defaultRewardPercentages.length - 1).map((percentage, index) => {
          const defaultRewardPercentage = defaultRewardPercentages[index] ?? 0n;
          const defaultAmount = (defaultRewardPercentage * currentDefaultMatchReward) / 100n;

          const amount = (percentage * totalFees) / 100n + defaultAmount;

          return (
            <Row key={index}>
              <div className="w-1/2 flex items-center justify-between">
                <Body className="text-ss-text-default underline">{ordinalSuffix(index + 1)} place</Body>
              </div>
              <OrbInput containerClassName="w-1/3" amount={amount} />
            </Row>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <OverlineSmall>Match rewards</OverlineSmall>
      <Body className="text-ss-text-default">
        There are default rewards for match participants, but you may split the entrance fee amongst winners of the
        match and yourself.
      </Body>

      <div className="h-6" />

      <div className="flex flex-col">
        <Row>
          <div className="w-1/2">
            <Body className="text-ss-text-default underline">Your earnings</Body>
          </div>
          <div className="w-1/2 flex">
            <PercentageInput
              className="bg-white"
              amount={creatorReward}
              setAmount={(a) => {
                const newRewardPercentages = [...rewardPercentages];
                newRewardPercentages[rewardPercentages.length - 1] = a;
                setRewardPercentages(newRewardPercentages);
              }}
            />
            <OrbInput amount={(creatorReward * totalFees) / 100n} />
          </div>
        </Row>

        {rewardPercentages.slice(0, rewardPercentages.length - 1).map((percentage, index) => {
          const defaultRewardPercentage = defaultRewardPercentages[index] ?? 0n;
          const defaultAmount = (defaultRewardPercentage * currentDefaultMatchReward) / 100n;

          const amount = (percentage * totalFees) / 100n;

          return (
            <Row key={index}>
              <div className="w-1/2 flex items-center justify-between">
                <Body className="text-ss-text-default underline">{ordinalSuffix(index + 1)} place</Body>
                <div className="flex items-center w-1/2 space-x-4">
                  <OrbInput amount={defaultAmount} />
                  <div>+</div>
                </div>
              </div>
              <div className="w-1/2 flex">
                <PercentageInput
                  className="bg-white"
                  amount={percentage}
                  setAmount={(a) => {
                    const newRewardPercentages = [...rewardPercentages];
                    newRewardPercentages[index] = a;
                    setRewardPercentages(newRewardPercentages);
                  }}
                />
                <OrbInput amount={amount} />
              </div>
            </Row>
          );
        })}

        <Row>
          <div className="w-1/2">
            <Body className="text-ss-text-default underline">Total</Body>
          </div>
          <div className="w-1/2">
            <div className="flex">
              <PercentageInput
                className={twMerge(error && "border border-red-500 text-red-500")}
                amount={totalPercentage}
              />
              <OrbInput
                className={twMerge(error && "border border-red-500 text-red-500")}
                amount={(totalPercentage * totalFees) / 100n}
              />
            </div>

            {error ? <Body className="text-red-500">{error}</Body> : <div className="h-6" />}
          </div>
        </Row>
      </div>
    </div>
  );
}
