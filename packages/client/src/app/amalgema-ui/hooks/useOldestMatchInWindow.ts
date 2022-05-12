import { Entity } from "@latticexyz/recs";
import { useEffect, useState } from "react";
import { getOldestMatchInWindow, getSkypoolConfig } from "../utils/skypool";
import { useAmalgema } from "../../../useAmalgema";
import { DateTime } from "luxon";

export const useOldestMatchInWindow = () => {
  const networkLayer = useAmalgema();

  const [oldestMatchInWindow, setOldestMatchInWindow] = useState<Entity | undefined>();

  useEffect(() => {
    const interval = setInterval(() => {
      const skypoolConfig = getSkypoolConfig(networkLayer);
      if (!skypoolConfig) return;

      const now = BigInt(Math.floor(DateTime.now().toUTC().toSeconds()));
      const oldestMatchInWindow = getOldestMatchInWindow(networkLayer, BigInt(now), skypoolConfig.window);
      setOldestMatchInWindow(oldestMatchInWindow);
    }, 1_000);

    return () => clearInterval(interval);
  }, [networkLayer]);

  return oldestMatchInWindow;
};
