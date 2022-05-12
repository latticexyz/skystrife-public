import { useEffect, useState } from "react";
import { Body, Caption } from "./Theme/SkyStrife/Typography";
import { useSyncStatus } from "./hooks/useSyncStatus";
import { useMUD } from "../../useMUD";

export function SyncStatus() {
  const {
    networkLayer: {
      network: { clock },
    },
  } = useMUD();
  const { lastBlockSyncedAt, latestSyncedBlockNumber } = useSyncStatus();

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

  return (
    <Body className={`fixed text-black bg-ss-bg-0 bottom-8 left-8 rounded-lg p-4`}>
      <div className={`flex items-center`}>
        <div
          className={`animate-pulse rounded-full w-4 h-4 mr-2`}
          style={{
            backgroundColor: statusColor,
          }}
        />
        <Caption className="text-black">
          {syncStatus === "ok" ? "Synced" : syncStatus === "concerning" ? "Syncing" : "Desynced (Consider Reloading)"}
        </Caption>
      </div>
      <span className="tabular-nums">latest block: {latestSyncedBlockNumber}</span>
    </Body>
  );
}
