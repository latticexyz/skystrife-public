import { useMUD } from "../../../useMUD";
import { Button } from "../Theme/SkyStrife/Button";
import { OverlineSmall } from "../Theme/SkyStrife/Typography";
import { TrashIcon } from "./TrashIcon";
import { PluginData, Plugins } from "./types";

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

  const { active, code: pluginCode } = pluginData;

  return (
    <div
      key={pluginKey}
      className="flex flex-row items-center justify-between border-2 border-ss-stroke bg-ss-bg-0 p-2"
    >
      <div className="font-bold">
        <span>{pluginKey}</span>
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
            const confirmDelete = confirm(`Are you sure you want to delete plugin: ${pluginKey}?`);
            if (confirmDelete) {
              deletePlugin();
              sendAnalyticsEvent("plugin-delete", {
                ...pluginData,
              });
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
                x: Math.floor(window.innerWidth / 2 / 36) * 36 - 144,
                y: Math.floor(window.innerHeight / 2 / 36) * 36,
              });
            }

            setPlugin(pluginKey, {
              active: !active,
            });

            sendAnalyticsEvent("plugin-toggle", {
              ...pluginData,
              active: !active,
            });
          }}
        >
          {active ? "Stop" : "Run"}
        </Button>
      </div>
    </div>
  );
}
