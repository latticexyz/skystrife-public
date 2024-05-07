import { useEffect, useState } from "react";
import { useAmalgema } from "../../../useAmalgema";

export function useSyncStatus() {
  const {
    network: { clock, storedBlockLogs$ },
  } = useAmalgema();
  const [latestSyncedBlockNumber, setLatestSyncedBlockNumber] = useState(0);
  const [lastBlockSyncedAt, setLastBlockSyncedAt] = useState(0);

  useEffect(() => {
    const blockStorageSub = storedBlockLogs$.subscribe((operation) => {
      setLatestSyncedBlockNumber(Number(operation.blockNumber));
      setLastBlockSyncedAt(clock.currentTime);
    });

    return () => {
      blockStorageSub.unsubscribe();
    };
  }, []);

  const [syncStatus, setSyncStatus] = useState<"ok" | "concerning" | "bad">();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const tickInterval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1_000);

    return () => clearInterval(tickInterval);
  }, []);

  useEffect(() => {
    if (!lastBlockSyncedAt) return;

    const diff = clock.currentTime - lastBlockSyncedAt;

    if (diff <= 5_000) {
      setSyncStatus("ok");
    } else if (diff < 10_000) {
      setSyncStatus("concerning");
    } else {
      setSyncStatus("bad");
    }
  }, [latestSyncedBlockNumber, lastBlockSyncedAt, tick]);

  const statusColor = syncStatus === "ok" ? "green" : syncStatus === "concerning" ? "yellow" : "red";

  return {
    lastBlockSyncedAt,
    latestSyncedBlockNumber,
    syncStatus,
    statusColor,
  };
}
