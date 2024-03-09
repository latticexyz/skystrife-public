// WARNING: Only types may be imported here.
import type { PluginLayer } from "client/src/layers/Plugins/createPluginLayer";

/**
 * Plugins must define a function named `createPlugin` that takes `PluginLayer`
 * and returns an object with `mount` and `unmount` methods.
 */
function createPlugin(pluginLayer: PluginLayer) {
  const {
    ui: {
      preact: { html, render, h, hooks },
      components: { Button, Select, TextInput },
    },
  } = pluginLayer;

  function Spacer() {
    return html`<div style=${{ height: "8px" }}></div>`;
  }

  const secondaryClicked = () => console.log("Secondary button clicked");

  return {
    // Called when the plugin is first loaded.
    mount: (container: HTMLDivElement) => {
      function App() {
        const [metal, setMetal] = hooks.useState<"Cu" | "Ag" | "Au">("Cu");
        const [textInputValue, setTextInputValue] = hooks.useState("");

        return html`<div style=${{ maxWidth: "320px", display: "flex", flexDirection: "column" }}>
          <h2>Hello, plugin</h2>

          <${Spacer} />

          <div>
            <${Button}
              ...${{
                buttonType: "primary",
                label: "Push me",
                style: { width: "40%" },
                onClick: (event) => alert(event.srcElement.innerText),
              }}
            />

            <${Button}
              ...${{
                buttonType: "secondary",
                label: "You can also push me",
                style: { width: "40%" },
                onClick: () => alert(`Metal: ${metal}\nText field: ${textInputValue}`),
              }}
            />
          </div>

          <${Spacer} />

          <${Select}
            ...${{
              label: "Metal",
              options: [
                { value: "Cu", label: "Copper" },
                { value: "Ag", label: "Silver" },
                { value: "Au", label: "Gold" },
              ],
              value: metal,
              onChange: (value: string) => setMetal(value as "Cu" | "Ag" | "Au"),
              style: { width: "100%" },
              containerStyle: { width: "100%" },
            }}
          />

          <${Spacer} />

          <${TextInput}
            ...${{
              label: "Text Input",
              value: textInputValue,
              placeholder: "Type something...",
              onChange: (value: string) => setTextInputValue(value),
              style: { width: "100%" },
            }}
          />
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
