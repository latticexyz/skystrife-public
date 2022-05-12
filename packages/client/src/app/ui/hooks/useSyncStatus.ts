import { useEffect, useState } from "react";
import { useMUD } from "../../../useMUD";

export function useSyncStatus() {
  const {
    networkLayer: {
      network: { clock, storedBlockLogs$ },
    },
  } = useMUD();
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

  return {
    lastBlockSyncedAt,
    latestSyncedBlockNumber,
  };
}
