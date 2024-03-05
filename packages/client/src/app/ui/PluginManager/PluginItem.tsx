import { Button } from "../Theme/SkyStrife/Button";
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
  const { active, code: pluginCode } = pluginData;

  return (
    <div
      key={pluginKey}
      className="flex flex-row items-center justify-between border-2 border-ss-stroke bg-ss-bg-0 p-2"
    >
      <div className="font-bold">{pluginKey}</div>
      <div className="flex gap-x-4">
        <div
          className="cursor-pointer flex items-center justify-center"
          onClick={() => {
            confirm(`Are you sure you want to delete plugin: ${pluginKey}?`) && deletePlugin();
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
          }}
        >
          {active ? "Stop" : "Run"}
        </Button>
      </div>
    </div>
  );
}
