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
      getDistanceBetween,
      getPosition,
      canAttack,
      canMoveToAndAttack,
    },
    actions: { attack, move },
    hotkeyManager,
    tileHighlighter,
  } = pluginLayer;

  const findClosestEnemy = (entity: Entity) => {
    const enemyUnits = getAllAttackableEntities(entity);
    if (!enemyUnits || enemyUnits.length === 0) return;

    let closestEnemy: Entity | undefined;
    let closestDistance = Infinity;

    const attackerPosition = getPosition(entity);
    if (!attackerPosition) return;

    for (const enemy of enemyUnits) {
      const enemyPosition = getPosition(enemy);
      if (!enemyPosition) continue;

      const distance = getDistanceBetween(attackerPosition, enemyPosition);

      if (distance < closestDistance) {
        closestEnemy = enemy;
        closestDistance = distance;
      }
    }

    return closestEnemy;
  };

  const frenzy = () => {
    const selectedEntity = getSelectedEntity();
    if (!selectedEntity) return;
    if (!isOwnedByCurrentPlayer(selectedEntity)) return;

    const closestEnemy = findClosestEnemy(selectedEntity);
    if (!closestEnemy) return;

    if (canAttack(selectedEntity, closestEnemy)) {
      resetSelection();
      attack(selectedEntity, closestEnemy);
      return;
    }

    const closestUnblockedPosition = canMoveToAndAttack(selectedEntity, closestEnemy);
    if (closestUnblockedPosition) {
      resetSelection();
      move(selectedEntity, closestUnblockedPosition, closestEnemy);
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
            const closestEnemyPosition = getPosition(findClosestEnemy(selectedEntity));
            if (closestEnemyPosition) {
              tileHighlighter.highlightTile(closestEnemyPosition, 0xff0000, 0.5);
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
            Press <span style=${highlightStyle}>F</span> when selecting one of your units to automatically
            <span style=${highlightStyle}> attack the closest enemy</span>.
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
