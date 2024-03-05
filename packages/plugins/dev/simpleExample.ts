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

  return {
    // Called when the plugin is first loaded.
    mount: (container: HTMLDivElement) => {
      function App() {
        const [selectOption, setSelectOption] = hooks.useState<"option1" | "option2" | "option3">("option1");
        const [textInputValue, setTextInputValue] = hooks.useState("");

        return html`<div style=${{ maxWidth: "320px", display: "flex", flexDirection: "column" }}>
          <p style=${{ fontWeight: "bold" }}>Hi, I'm a plugin!</p>
          <p>Try dragging me around or minimizing me.</p>
          <p>Plugins have access to a library of components and utilities.</p>

          <${Spacer} />

          <${Button}
            ...${{
              buttonType: "primary",
              label: "I'm a button!",
              style: { width: "100%" },
            }}
          />

          <${Spacer} />

          <${Button}
            ...${{
              buttonType: "secondary",
              label: "I'm also a button",
              style: { width: "100%" },
            }}
          />

          <${Spacer} />

          <${Select}
            ...${{
              label: "Select",
              options: [
                { value: "option1", label: "Option 1" },
                { value: "option2", label: "Option 2" },
                { value: "option3", label: "Option 3" },
              ],
              value: selectOption,
              onChange: (value: string) => setSelectOption(value as "option1" | "option2" | "option3"),
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
