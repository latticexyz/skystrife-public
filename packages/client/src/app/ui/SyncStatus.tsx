import { Body, Caption } from "./Theme/SkyStrife/Typography";
import { useSyncStatus } from "./hooks/useSyncStatus";

export function SyncStatus() {
  const { latestSyncedBlockNumber, syncStatus, statusColor } = useSyncStatus();

  return (
    <Body className={`fixed text-black bg-ss-bg-0 bottom-4 right-4 rounded-lg p-4`}>
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
