# playerDetails.ts explanation

Here is the detailed explanation for [this plugin](../dev/playerDetails.ts).
This plugin demonstrates how to read game information, which is already cached in the client.

Note that this explanation assumes you are already familiar with [`uiExample.ts`](./uiExample.md).
If you are not, read that documentation first.

## The source code

```typescript
import type { Entity } from "@latticexyz/recs";
import type { PluginLayer } from "client/src/layers/Plugins/createPluginLayer";
```

SkyStrife uses [the ECS model](https://mud.dev/guides/emojimon/1-preface-the-ecs-model), so we need [the `Entity` type](https://github.com/latticexyz/mud/blob/main/packages/recs/src/types.ts).

```typescript
/**
 * Plugins must define a function named `createPlugin` that takes `PluginLayer` and returns an object with `mount` and `unmount` methods.
 */
function createPlugin(pluginLayer: PluginLayer) {
  const {
    ui: {
      .
      .
      .
    },
    api: { getPlayerDetails, getPlayerGold, getAllPlayerEntities, onNewTurn, getUnitType },
  } = pluginLayer;
```

In addition to the `ui`, `pluginLayer` includes an `api` structure with functions we can use to read game information and an `actions` structure with functions that implement actions the player can choose.

```typescript
  return {
    mount: (container: HTMLDivElement) => {
      function PlayerDetails({ player }: { player: Entity }) {
```

This function implements a component that shows the details of a specific player.

```typescript
const [playerGold, setPlayerGold] = useState(getPlayerGold(player));
const [playerEntities, setPlayerEntities] = useState<Entity[]>(getAllPlayerEntities(player));
```

State variables to store the player's gold information (how much currently, and much it increases per turn) and the entities that are owned by the player.

```typescript
const playerDetails = getPlayerDetails(player);
```

This function is defined in [`createPluginLayer.ts`](../../../packages/client/src/layers/Plugins/createPluginLayer.ts#L82-L91).
You can see there what information it provides.

```typescript
        const playerEntitiesByUnitType = playerEntities.reduce((acc, entity) => {
```

Use [`reduce`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) to get the number of units of each type.

```typescript
          const unitType = getUnitType(entity);
          if (unitType) {
            acc[unitType] = (acc[unitType] || 0) + 1;
```

If `unitType` is defined, increment the accumulator value for that unit type.
If there is currently no value (`undefined`), assume it is zero.

Note that `unitType` may not be defined because there are two types of owned entities:

- Units, for which [`getUnitType`](<(../../../packages/client/src/layers/Plugins/createPluginLayer.ts#L61-L95)>) returns a valid result.
- Structures, for which `getUnitType` returns `undefined`.
  You can get their type with [`getStructureType`](<(../../../packages/client/src/layers/Plugins/createPluginLayer.ts#L67-L71)>)

```typescript
          }
          return acc;
        }, {} as Record<string, number>);
```

Use the Typescript [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type) type for the result.

```typescript
        useEffect(() => {
          // only refresh these details when a new turn starts
          // listening for all updates would be too much
```

Use [`useEffect`](https://preactjs.com/guide/v10/hooks/#useeffect) to specify when to update player information.

```typescript
const sub = onNewTurn((_turn) => {
  setPlayerGold(getPlayerGold(player));
  setPlayerEntities(getAllPlayerEntities(player));
});
```

Run the parameter function (update the player's gold and entities) once every new turn.
This avoids having to run queries every time any data updates.

```typescript
return () => {
  sub.unsubscribe();
};
```

The return value of the `useEffect` parameter function is a function to call to remove the subscription.

```typescript
        }, [player]);
```

When the `player` value changes we need to resubscribe because the function changes (it's the same function in syntax, but the value of `player` is different so it updates the state variables to different values).

```typescript
        return html`<div style=${{ textAlign: "center" }}>
          .
          .
          .
        </div>`;
      }
```

This ends the `PlayerDetails` component.

```typescript
      function App() {
```

The top level component of the plugin.

```typescript
const playersInMatch = usePlayersInMatch();
const [viewingPlayer, setViewingPlayer] = useState<Entity | null>(playersInMatch[0] || null);
```

`viewingPlayer` is the player currently being viewed (or `null` when there isn't a value).

```typescript
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
```

Select which player to view.

```typescript

          <div style=${{ height: "16px" }} />

          ${viewingPlayer ? html`<${PlayerDetails} player=${viewingPlayer} />` : null}
        </div>`;
      }
```

Actually show the player information.

```typescript
      render(h(App, {}), container);
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    unmount: () => {},
  };
}
```
