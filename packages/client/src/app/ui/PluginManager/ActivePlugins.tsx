import { PluginData, Plugins } from "./types";
import { ActivePlugin } from "./ActivePlugin";

export function ActivePlugins({
  plugins,
  setPlugin,
}: {
  plugins: Plugins;
  setPlugin: (pluginKey: string, data: Partial<PluginData>) => void;
}) {
  return (
    // must be rendered in a fixed, top-left position div because the position
    // of the plugins is relative to the parent element
    <div className="fixed h-screen w-screen top-0 left-0">
      {Object.entries(plugins).map(([pluginKey, plugin]) => {
        return (
          <ActivePlugin key={pluginKey} pluginKey={pluginKey} pluginData={plugin} setPlugin={setPlugin}></ActivePlugin>
        );
      })}
    </div>
  );
}
