import { PhaserLayer } from "../..";
import { Plugins } from "../../../../../app/ui/PluginManager/types";

export function createPluginAnalyticsSystem(layer: PhaserLayer) {
  const {
    parentLayers: {
      local: {
        components: { MatchStarted },
      },
      network: {
        utils: { sendAnalyticsEvent },
        network: { matchEntity },
      },
    },
  } = layer;

  MatchStarted.update$.subscribe(({ entity }) => {
    if (entity === matchEntity) {
      const plugins = localStorage.getItem("plugins");
      if (!plugins) return;

      const pluginsJSON = JSON.parse(plugins) as Plugins;
      const pluginKeys = Object.keys(pluginsJSON).filter((k) => pluginsJSON[k].active);

      sendAnalyticsEvent("plugin-loadout", {
        activePlugins: pluginKeys,
      });
    }
  });
}
