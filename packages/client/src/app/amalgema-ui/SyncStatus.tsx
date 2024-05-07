import { Caption } from "../ui/Theme/SkyStrife/Typography";
import { useSyncStatus } from "../ui/hooks/useSyncStatus";

export function SyncStatus() {
  const { syncStatus, statusColor } = useSyncStatus();

  return (
    <div className="flex">
      <div className={`flex items-center`}>
        <div
          className={`animate-pulse rounded-full w-4 h-4 mr-2`}
          style={{
            backgroundColor: statusColor,
          }}
        />
        <Caption className="text-black">
          {syncStatus === "ok" ? "Synced" : syncStatus === "concerning" ? "Syncing" : "Desynced (Try Reloading)"}
        </Caption>
      </div>
    </div>
  );
}
