import useLocalStorageState from "use-local-storage-state";
import { useMUD } from "../../../useMUD";
import { Button } from "../Theme/SkyStrife/Button";
import { OverlineSmall } from "../Theme/SkyStrife/Typography";
import { TrashIcon } from "./TrashIcon";
import { PluginData, Plugins } from "./types";
import { ConfirmedCheck } from "../Theme/SkyStrife/Icons/ConfirmedCheck";

export function PluginItem({
  pluginKey,
  pluginData,
  setPlugin,
  deletePlugin,
  plugins,
}: {
  pluginKey: string;
  pluginData: PluginData;
  setPlugin: (pluginKey: string, data: Partial<PluginData>) => void;
  deletePlugin: () => void;
  plugins: Plugins;
}) {
  const {
    networkLayer: {
      utils: { sendAnalyticsEvent },
    },
  } = useMUD();
  const [deletedOfficialPlugins, setDeletedOfficialPlugins] = useLocalStorageState<string[]>("deletedOfficialPlugins", {
    defaultValue: [],
  });

  const { active, code: pluginCode } = pluginData;

  return (
    <div key={pluginKey} className="flex flex-row items-center justify-between border border-ss-stroke bg-ss-bg-0 p-2">
      <div className="font-bold">
        <span className="flex gap-x-1 items-center">
          {pluginData.source === "official" && <ConfirmedCheck />}
          {pluginKey}
        </span>
        <OverlineSmall
          style={{
            fontSize: "0.7rem",
            lineHeight: "1rem",
          }}
        >
          {pluginData.source}
        </OverlineSmall>
      </div>
      <div className="flex gap-x-4">
        <div
          className="cursor-pointer flex items-center justify-center"
          onClick={() => {
            const confirmDelete = confirm(
              `Are you sure you want to delete plugin: ${pluginKey}? This cannot be undone.`
            );
            if (confirmDelete) {
              deletePlugin();
              sendAnalyticsEvent("plugin-delete", {
                pluginKey,
                ...pluginData,
              });

              if (pluginData.source === "official") {
                setDeletedOfficialPlugins([...deletedOfficialPlugins, pluginKey]);
              }
            }
          }}
        >
          <TrashIcon />
        </div>

        <Button
          buttonType={!active ? "primary" : "secondary"}
          disabled={!pluginCode}
          className="p-1 px-2"
          onClick={() => {
            if (!pluginCode) return;

            if (!plugins[pluginKey]?.x) {
              setPlugin(pluginKey, {
                // keep them on the grid
                x: Math.floor(window.innerWidth / 2 / 32) * 32 - 144,
                y: Math.floor(window.innerHeight / 2 / 32) * 32,
              });
            }

            const newActive = !active;
            setPlugin(pluginKey, {
              active: newActive,
            });

            sendAnalyticsEvent("plugin-toggle", {
              pluginKey,
              ...pluginData,
              active: newActive,
            });
          }}
        >
          {active ? "Stop" : "Run"}
        </Button>
      </div>
    </div>
  );
}
