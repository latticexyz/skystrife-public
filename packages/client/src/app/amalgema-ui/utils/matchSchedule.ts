import { DateTime } from "luxon";

export function createMatchTimes(time: DateTime) {
  const dayTime = time.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

  const times = [];
  for (let i = 0; i <= 24; i += 4) {
    times.push(dayTime.set({ hour: i }));
  }

  return times;
}
