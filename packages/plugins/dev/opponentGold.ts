// WARNING: Only types may be imported here.
import type { PluginLayer } from "client/src/layers/Plugins/createPluginLayer";

/**
 * Plugins must define a function named `createPlugin` that takes `PluginLayer`
 * and returns an object with `mount` and `unmount` methods.
 */
function createPlugin(pluginLayer: PluginLayer) {
  const {
    ui: {
      preact: {
        html,
        render,
        h,
        hooks: { useEffect, useState },
      },
      hooks: { useMatchStatus },
    },
    api: { getPlayersInMatch, getPlayerDetails, getPlayerGold, onNewTurn },
  } = pluginLayer;

  return {
    // Called when the plugin is first loaded.
    mount: (container: HTMLDivElement) => {
      function App() {
        const [players, setPlayers] = useState<ReturnType<typeof getPlayerDetails>[]>([]);
        const [playerGold, setPlayerGold] = useState<ReturnType<typeof getPlayerGold>[]>([]);

        const matchStatus = useMatchStatus();

        useEffect(() => {
          const sub = onNewTurn(() => {
            const allPlayers = getPlayersInMatch();
            const playerDetails = allPlayers.map((player) => getPlayerDetails(player));
            setPlayers(playerDetails);

            const gold = allPlayers.map((player) => getPlayerGold(player));
            setPlayerGold(gold);
          });

          return () => {
            sub.unsubscribe();
          };
        }, []);

        if (matchStatus === "finished") {
          return html`<div>Match is over</div>`;
        }

        if (matchStatus !== "started") {
          return html`<div>Match has not started</div>`;
        }

        return html`<div style=${{ display: "flex", flexDirection: "column" }}>
          ${playerGold.map((gold, index) => {
            if (!players[index]) return null;

            return html`<div key=${index} style=${{ display: "flex", justifyContent: "space-between" }}>
              <div
                style=${{
                  color: `${players[index]?.color.color.toString(16)}`,
                  fontWeight: "bold",
                }}
              >
                ${players[index]?.name}
              </div>
              <div>${gold.currentGold}</div>
            </div>`;
          })}
        </div>`;
      }

      render(h(App, {}), container);
    },
    // Called when a user manually stops the plugin
    // or when plugin code is updated.
    // Use this to clean up any resources or event listeners
    // that you set up during mount.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    unmount: () => {},
  };
}
