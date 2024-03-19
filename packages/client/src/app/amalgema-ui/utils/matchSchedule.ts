import { DateTime } from "luxon";

export const HOURS_BETWEEN_MATCHES = 8;

export function createMatchTimes(time: DateTime, daysAhead = 1) {
  const hoursInDay = 24;
  const dayTime = time.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

  const times = [];
  for (let d = 0; d < daysAhead; d++) {
    for (let i = 0; i <= hoursInDay; i += HOURS_BETWEEN_MATCHES) {
      times.push(dayTime.set({ hour: i, day: time.day + d }));
    }
  }

  return times;
}
