import { Button } from "../ui/Theme/SkyStrife/Button";
import DangerSection from "../ui/Theme/SkyStrife/DangerSection";
import { Caption } from "../ui/Theme/SkyStrife/Typography";
import { useSyncStatus } from "../ui/hooks/useSyncStatus";
import { Modal } from "./Modal";

export function SyncStatus() {
  const { syncStatus, statusColor } = useSyncStatus();

  return (
    <>
      <Modal
        isOpen={syncStatus === "bad"}
        title="Desync Detected"
        footer={
          <Button className="mx-auto px-8" buttonType="danger" onClick={() => window.location.reload()}>
            Reload
          </Button>
        }
      >
        <DangerSection>
          Your client is out of sync and is no longer receiving onchain data. Please reload the page.
        </DangerSection>
      </Modal>

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
    </>
  );
}
