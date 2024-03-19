import type { Entity } from "@latticexyz/recs";
import type { PluginLayer } from "client/src/layers/Plugins/createPluginLayer";

/**
 * Plugins must define a function named `createPlugin` that takes `PluginLayer` and returns an object with `mount` and `unmount` methods.
 */
function createPlugin(pluginLayer: PluginLayer) {
  const {
    api: {
      getSelectedEntity,
      resetSelection,
      getAllAttackableEntities,
      isOwnedByCurrentPlayer,
      calculateCombatResult,
      getPosition,
      canAttack,
      canMoveToAndAttack,
    },
    actions: { attack, move },
    hotkeyManager,
    tileHighlighter,
  } = pluginLayer;

  const findBestTarget = (attacker: Entity) => {
    const targets = getAllAttackableEntities(attacker);
    if (!targets || targets.length === 0) return;

    let bestTarget: Entity | undefined;
    let mostDamage = 0;

    const attackerPosition = getPosition(attacker);
    if (!attackerPosition) return;

    for (const target of targets) {
      const combatResult = calculateCombatResult(attacker, target);
      if (combatResult && combatResult.attackerDamage > mostDamage) {
        mostDamage = combatResult.attackerDamage;
        bestTarget = target;
      }
    }

    return bestTarget;
  };

  const frenzy = () => {
    const selectedEntity = getSelectedEntity();
    if (!selectedEntity) return;
    if (!isOwnedByCurrentPlayer(selectedEntity)) return;

    const bestTarget = findBestTarget(selectedEntity);
    if (!bestTarget) return;

    if (canAttack(selectedEntity, bestTarget)) {
      resetSelection();
      attack(selectedEntity, bestTarget);
      return;
    }

    const closestUnblockedPosition = canMoveToAndAttack(selectedEntity, bestTarget);
    if (closestUnblockedPosition) {
      resetSelection();
      move(selectedEntity, closestUnblockedPosition, bestTarget);
      return;
    }
  };

  return {
    mount: (container: HTMLDivElement) => {
      hotkeyManager.addHotkey("f", frenzy);

      const {
        ui: {
          preact: {
            html,
            render,
            h,
            hooks: { useMemo, useEffect },
          },
          hooks: { useSelectedEntity },
        },
        api: { getAllAttackableEntities },
      } = pluginLayer;

      function App() {
        const selectedEntity = useSelectedEntity();
        const attackableEntities = useMemo(() => getAllAttackableEntities(selectedEntity), [selectedEntity]);

        useEffect(() => {
          tileHighlighter.clearAll();

          if (selectedEntity) {
            const bestTargetPosition = getPosition(findBestTarget(selectedEntity));
            if (bestTargetPosition) {
              tileHighlighter.highlightTile(bestTargetPosition, 0xff0000, 0.5);
            }
          }

          return () => {
            tileHighlighter.clearAll();
          };
        }, [selectedEntity]);

        const highlightStyle = {
          color: "red",
          fontWeight: "bold",
        };

        return html`<div style=${{ maxWidth: "320px" }}>
          <p>
            Press <span style=${highlightStyle}>F</span> when selecting one of your units to automatically execute the
            attack that <span style=${highlightStyle}>does the most damage</span>.
          </p>
          ${selectedEntity
            ? html`<p>
                There are currently <span style=${highlightStyle}>${attackableEntities?.length ?? 0}</span> enemies in
                range.
              </p>`
            : null}
        </div>`;
      }

      render(h(App, {}), container);
    },
    unmount: () => {
      hotkeyManager.removeHotkey("f");
    },
  };
}
