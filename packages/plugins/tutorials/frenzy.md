# frenzy.ts explanation

Here is the detailed explanation for [this plugin](../dev/frenzy.ts).
This plugin demonstrates how to perform actions for the player.
Specifically, it allows the player to specify that an owned entity will attack the entity which it can damage the most.

Note that this explanation assumes you are already familiar with [`uiExample`](./uiExample.md) and [`playerDetails`](./playerDetails.md).
If you are not, read the documentation for those first.

## The source code

```typescript
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
```

In addition to `api`, which lets you read information, this plugin requires `actions`, which includes the functions that are called when the player makes a move.

```typescript
    hotkeyManager,
    tileHighlighter,
  } = pluginLayer;
```

We also need [`hotkeyManager`](../../../packages/client/src/layers/Plugins/createPluginLayer.ts#L137-L146), which lets us listen to a keypress, and [`tileHighlighter`](../../../packages/client/src/layers/Plugins/createTileHighlighter.ts), which lets us highlight a square on the map.

```typescript
  const findBestTarget = (attacker: Entity) => {
```

Find a target to attack.

```typescript
const targets = getAllAttackableEntities(attacker);
if (!targets || targets.length === 0) return;
```

Get the list of targets from [`getAllAttackableEntities`](../../../packages/client/src/layers/Local/createLocalLayer.ts#L526-L586)
Those targets can be either enemy units or structures.

```typescript
let bestTarget: Entity | undefined;
let mostDamage = 0;

const attackerPosition = getPosition(attacker);
if (!attackerPosition) return;
```

We can only attack with entities that are on the map.

```typescript
    for (const target of targets) {
      const combatResult = calculateCombatResult(attacker, target);
      if (combatResult && combatResult.attackerDamage > mostDamage) {
        mostDamage = combatResult.attackerDamage;
        bestTarget = target;
      }
    }

    return bestTarget;
  };
```

Find the entity we can harm the most and return it.

```typescript
  const frenzy = () => {
```

This is the function that actually implements the attack.

```typescript
const selectedEntity = getSelectedEntity();
if (!selectedEntity) return;
if (!isOwnedByCurrentPlayer(selectedEntity)) return;
```

The selected entity has to be owned by the current player.

```typescript
const bestTarget = findBestTarget(selectedEntity);
if (!bestTarget) return;
```

Find the target, if any.

```typescript
if (canAttack(selectedEntity, bestTarget)) {
  resetSelection();
  attack(selectedEntity, bestTarget);
  return;
}
```

If we can attack the target immediately, reset the selection (because the current unit is going to be exhausted) and attack.

```typescript
    const closestUnblockedPosition = canMoveToAndAttack(selectedEntity, bestTarget);
    if (closestUnblockedPosition) {
      resetSelection();
      move(selectedEntity, closestUnblockedPosition, bestTarget);
      return;
    }
  };
```

Otherwise, move to a position we can attack from and then attack.

```typescript
  return {
    mount: (container: HTMLDivElement) => {
      hotkeyManager.addHotkey("f", frenzy);
```

When the plugin is mounted, bind the F key to `frenzy` to perform a frenzy attack.

```typescript

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
```

The plugin's top level component.

```typescript
        const selectedEntity = useSelectedEntity();
        const attackableEntities = useMemo(() => getAllAttackableEntities(selectedEntity), [selectedEntity]);

        useEffect(() => {
          tileHighlighter.clearAll();
```

Clear all highlights.

```typescript
if (selectedEntity) {
  const bestTargetPosition = getPosition(findBestTarget(selectedEntity));
  if (bestTargetPosition) {
    tileHighlighter.highlightTile(bestTargetPosition, 0xff0000, 0.5);
  }
}
```

If there is a selected entity, see if there is also a target it could attack in a frenzy.
If so, highlight that target.

```typescript
return () => {
  tileHighlighter.clearAll();
};
```

When we are removed (usually because the player selected a different entity), remove all highlights.

```typescript
        }, [selectedEntity]);
```

This `useEffect` is executed every time `selectedEntity` changes.

```typescript
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
```

Here we actually need the `unmount`, because we need to remove the binding between F and `frenzy`.
