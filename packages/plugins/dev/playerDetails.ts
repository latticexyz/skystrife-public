import type { Entity } from "@latticexyz/recs";
import type { PluginLayer } from "client/src/layers/Plugins/createPluginLayer";

/**
 * Plugins must define a function named `createPlugin` that takes `PluginLayer` and returns an object with `mount` and `unmount` methods.
 */
function createPlugin(pluginLayer: PluginLayer) {
  const {
    ui: {
      preact: {
        html,
        render,
        h,
        hooks: { useState, useEffect },
      },
      hooks: { usePlayersInMatch },
      components: { Select, TextInput, Highlight, Sprite },
    },
    api: { getPlayerDetails, getPlayerGold, getAllPlayerEntities, onNewTurn, getUnitType },
  } = pluginLayer;

  return {
    mount: (container: HTMLDivElement) => {
      function PlayerDetails({ player }: { player: Entity }) {
        const [playerGold, setPlayerGold] = useState(getPlayerGold(player));
        const [playerEntities, setPlayerEntities] = useState<Entity[]>(getAllPlayerEntities(player));

        const playerDetails = getPlayerDetails(player);
        const playerEntitiesByUnitType = playerEntities.reduce((acc, entity) => {
          const unitType = getUnitType(entity);
          if (unitType) {
            acc[unitType] = (acc[unitType] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        useEffect(() => {
          // only refresh these details when a new turn starts
          // listening for all updates would be too much
          const sub = onNewTurn((_turn) => {
            setPlayerGold(getPlayerGold(player));
            setPlayerEntities(getAllPlayerEntities(player));
          });

          return () => {
            sub.unsubscribe();
          };
        }, [player]);

        return html`<div style=${{ textAlign: "center" }}>
          <${TextInput} label="Address" value=${playerDetails?.walletAddress} />
          <p><${Highlight} value=${playerGold.currentGold.toString()} /> current gold</p>
          <p><${Highlight} value=${playerGold.goldPerTurn.toString()} /> gold/turn</p>
          <p>
            <${Highlight} highlightType=${"secondary"} value=${playerEntities.length.toString()} /> owned entities
            (units and structures)
          </p>
          <div
            style=${{
              width: "100%",
              maxHeight: "200px",
              display: "flex",
              flexDirection: "column",
              flexWrap: "wrap",
              alignItems: "baseline",
            }}
          >
            ${Object.entries(playerEntitiesByUnitType).map(([unitType, count]) => {
              return html`<div style=${{ transform: "scale(0.8)", display: "flex", alignItems: "center" }}>
                <${Sprite} unitType=${unitType} scale=${2} colorName=${playerDetails?.color.name} />
                <p style=${{ fontSize: "2rem" }}>${count}</p>
              </div>`;
            })}
          </div>
        </div>`;
      }

      function App() {
        const playersInMatch = usePlayersInMatch();
        const [viewingPlayer, setViewingPlayer] = useState<Entity | null>(playersInMatch[0] || null);

        return html`<div style=${{ maxWidth: "320px" }}>
          <${Select}
            label="Select Player"
            options=${playersInMatch.map((player) => ({
              label: getPlayerDetails(player)?.name,
              value: player,
            }))}
            value=${viewingPlayer}
            onChange=${(value: string) => {
              setViewingPlayer(playersInMatch.find((player) => player === value) || null);
            }}
          />

          <div style=${{ height: "16px" }} />

          ${viewingPlayer ? html`<${PlayerDetails} player=${viewingPlayer} />` : null}
        </div>`;
      }

      render(h(App, {}), container);
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    unmount: () => {},
  };
}
