import { useEffect, useState } from "react";
import { DateTime } from "luxon";

export function useCurrentTime() {
  const [time, setTime] = useState(DateTime.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(DateTime.now());
    }, 1_000);

    return () => clearInterval(interval);
  }, []);

  return time;
}
