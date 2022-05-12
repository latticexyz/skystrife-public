import { Observable, distinctUntilChanged, filter, map } from "rxjs";
import { getCurrentTurn } from "../../Network/utils";
import { BigNumber } from "ethers";

export type Clock = {
  time$: Observable<number>;
  currentTime: number;
  lastUpdateTime: number;
  update: (time: number, maintainStale?: boolean) => void;
  dispose: () => void;
};

export function createTurnStream(
  getMatchConfig: () =>
    | {
        startTime: BigNumber;
        turnLength: BigNumber;
      }
    | undefined,
  clock: Clock
) {
  return clock.time$.pipe(
    map(() => {
      const matchConfig = getMatchConfig();
      if (!matchConfig) {
        return -1;
      }
      return getCurrentTurn(matchConfig.startTime, matchConfig.turnLength, clock);
    }),
    filter((turn) => turn !== -1),
    distinctUntilChanged()
  );
}
