// WARNING: Only types may be imported here.
import type { Entity } from "@latticexyz/recs";
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
        hooks: { useEffect },
      },
      hooks: { useTransactions },
      components: { Highlight },
    },
    api: { selectAndView, getEntityName },
    hotkeyManager,
  } = pluginLayer;

  const HOTKEY = "q";

  function getStatusColor(status: string | undefined) {
    switch (status) {
      case "completed":
        return "lime";
      case "reverted":
        return "lightcoral";
      default:
        return "yellow";
    }
  }

  return {
    // Called when the plugin is first loaded.
    mount: (container: HTMLDivElement) => {
      function App() {
        const transactions = useTransactions();

        // Sky Strife separates the concept of "actions" and "transactions".
        // An action is the high-level intent of the player i.e. Attack this target.
        // An action may result in multiple transactions when a transaction failure
        // occurs and we send another retry transaction.
        const transactionsGroupedByAction = transactions
          .sort((a, b) => Number((b.submittedTimestamp ?? 0n) - (a.submittedTimestamp ?? 0n)))
          .reduce((acc, tx) => {
            if (!tx.actionId) return acc;

            acc[tx.actionId] = acc[tx.actionId] || [];
            acc[tx.actionId].push(tx);
            return acc;
          }, {} as Record<string, ReturnType<typeof useTransactions>>);

        const mostRecentTxsForAction = Object.entries(transactionsGroupedByAction)
          .map(([_, txs]) => {
            const mostRecentTx = txs.sort((a, b) =>
              Number((b.submittedTimestamp ?? 0n) - (a.submittedTimestamp ?? 0n))
            )[0];

            return mostRecentTx;
          })
          .slice(0, 5);

        useEffect(() => {
          hotkeyManager.addHotkey(HOTKEY, () => {
            for (const tx of mostRecentTxsForAction) {
              if (tx.entity && tx.status === "reverted") {
                selectAndView(tx.entity);
                return;
              }
            }
          });

          return () => {
            hotkeyManager.removeHotkey(HOTKEY);
          };
        }, [mostRecentTxsForAction, hotkeyManager]);

        return html`<div style=${{ display: "flex", flexDirection: "column", maxWidth: "400px" }}>
          <p>
            Press <${Highlight} value=${HOTKEY.toUpperCase()} /> to select the entity with the most recent failed
            action.
          </p>

          ${mostRecentTxsForAction.map((tx, index) => {
            let entityName = "Unknown Entity";
            if (["Move", "MoveAndAttack", "Build", "Attack"].includes(tx?.systemId ?? "")) {
              entityName = getEntityName(tx.entity);
            }

            return html`<div
              key=${index}
              style=${{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <button
                style=${{ marginRight: "8px" }}
                onClick=${() => {
                  if (tx.entity) selectAndView(tx.entity);
                }}
              >
                ${entityName} ${tx.systemId}
              </button>
              <div
                style=${{
                  border: `2px solid ${getStatusColor(tx.status)}`,
                  backgroundColor: "grey",
                  borderRadius: "4px",
                  color: getStatusColor(tx.status),
                  padding: "4px",
                  marginBottom: "2px",
                }}
              >
                ${tx?.status}
              </div>
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
    unmount: () => {
      hotkeyManager.removeHotkey(HOTKEY);
    },
  };
}
