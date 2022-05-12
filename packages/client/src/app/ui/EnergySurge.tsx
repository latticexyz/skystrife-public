import { useMUD } from "../../useMUD";
import { useObservableValue } from "@latticexyz/react";

export const EnergySurge = () => {
  const {
    networkLayer: {
      network: {
        clock: { time$ },
      },
      api: { getCurrentMatchConfig },
    },
  } = useMUD();

  const time = useObservableValue(time$, 0);

  const gameConfig = getCurrentMatchConfig();
  if (!gameConfig) return <></>;

  const gameStartTime = BigInt(gameConfig.startTime);
  const turnLength = BigInt(gameConfig.turnLength);

  const currentTime = BigInt(time) / 1000n;
  const timeElapsed = currentTime - gameStartTime;
  const secondsUntilNextTurn = turnLength - (timeElapsed % turnLength);

  const secondsElapsedInTurn = turnLength - secondsUntilNextTurn;
  const percentTurnElapsed = Number(secondsElapsedInTurn) / Number(turnLength - 1n);

  return (
    <div
      style={{
        backgroundColor: "#F4F3F1",
      }}
      className="rounded h-[48px] w-[320px] mt-2 bg-ss-bg-0 rounded border border-[#181710] overflow-hidden shadow-ss-default"
    >
      <div
        className="inset-0  bg-[#E0C56C] h-full"
        style={{
          transition: "width 1s linear",
          width: `calc(100% * ${percentTurnElapsed})`,
        }}
      ></div>
    </div>
  );
};
