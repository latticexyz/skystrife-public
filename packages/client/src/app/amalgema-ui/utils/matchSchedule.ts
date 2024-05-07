import { DateTime } from "luxon";

export const HOURS_BETWEEN_MATCHES = 8;
export const START_HOUR = 2;

export function createMatchTimes(time: DateTime, daysAhead = 2) {
  const hoursInDay = 24;
  const startTime = time.toUTC().set({ hour: START_HOUR, minute: 0, second: 0, millisecond: 0 });
  const numSummonTimes = daysAhead * (hoursInDay / HOURS_BETWEEN_MATCHES);

  const times: DateTime[] = [];
  for (let i = 0; i < numSummonTimes; i++) {
    times.push(startTime.plus({ hours: HOURS_BETWEEN_MATCHES * i }));
  }

  return times;
}
