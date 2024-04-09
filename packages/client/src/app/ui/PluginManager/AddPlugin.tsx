import { createPluginLayer } from "../../../layers/Plugins/createPluginLayer";
import { useMUD } from "../../../useMUD";
import { Button } from "../Theme/SkyStrife/Button";
import { Input } from "../Theme/SkyStrife/Input";
import { Body } from "../Theme/SkyStrife/Typography";
import { ChainIcon } from "./ChainIcon";
import { PLUGIN_DOCS_URL, convertTsPluginToJs } from "./PluginManager";
import { TerminalIcon } from "./TerminalIcon";
import { PluginData } from "./types";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

function ImportPluginForm({
  setPlugin,
  setManagerState,
}: {
  setPlugin: (pluginKey: string, data: Partial<PluginData>) => void;
  setManagerState: (state: "open" | "adding") => void;
}) {
  const {
    networkLayer: {
      utils: { sendAnalyticsEvent },
    },
    phaserLayer,
  } = useMUD();

  const [pluginLoading, setPluginLoading] = useState(false);
  const [newPluginName, setNewPluginName] = useState("");
  const [pluginUrl, setPluginUrl] = useState("");
  const [newPluginError, setNewPluginError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-y-2">
      <Input label="Plugin Name" value={newPluginName} setValue={setNewPluginName} />

      <Input label="Plugin URL" value={pluginUrl} setValue={setPluginUrl} />

      <div className="h-0" />

      <Button
        buttonType="primary"
        className="w-full"
        disabled={!pluginLoading && (!newPluginName || !pluginUrl)}
        onClick={async () => {
          if (!newPluginName) {
            setNewPluginError("Plugin name is required");
            return;
          }

          if (!pluginUrl) {
            setNewPluginError("Plugin URL is required");
            return;
          }

          setPluginLoading(true);

          await fetch(pluginUrl)
            .then((res) => res.text())
            .then((code) => {
              let jsCode = "";

              try {
                jsCode = convertTsPluginToJs(code);
              } catch (e) {
                setNewPluginError("Plugin code is not valid TypeScript");
                return;
              }

              if (jsCode.length === 0) {
                setNewPluginError("Plugin code is empty");
                return;
              }

              try {
                const pluginLayer = createPluginLayer(phaserLayer, newPluginName);
                const createPlugin = eval(`(${jsCode})`);
                createPlugin(pluginLayer);
              } catch (e) {
                setNewPluginError("Invalid plugin. Please check the plugin code or reach out to the plugin author.");
                return;
              }

              try {
                setPlugin(newPluginName, { code: jsCode, source: "remote" });
                setNewPluginName("");
                setPluginUrl("");
                setNewPluginError(null);
                setManagerState("open");

                sendAnalyticsEvent("plugin-add", {
                  pluginKey: newPluginName,
                  name: newPluginName,
                  source: "remote",
                });
              } catch (e) {
                setNewPluginError((e as any).error?.message);
              }
            })
            .catch((e) => {
              setNewPluginError(e.message);
            });

          setPluginLoading(false);
        }}
      >
        Add
      </Button>

      {newPluginError && (
        <div className="mt-4 text-red-600 w-full text-center p-4 rounded-md border-2 border-red-600 bg-red-200/50">
          {newPluginError}
        </div>
      )}
    </div>
  );
}

export function AddPlugin({
  setPlugin,
  setManagerState,
}: {
  setPlugin: (pluginKey: string, data: Partial<PluginData>) => void;
  setManagerState: (state: "open" | "adding") => void;
}) {
  const [addMethod, setAddMethod] = useState<"dev" | "remote">("remote");
  const [chosenAddMethod, setChosenAddMethod] = useState<"dev" | "remote" | null>(null);

  const chooseAddMethodForm = (
    <>
      <div
        onClick={() => {
          setAddMethod("remote");
        }}
        className={twMerge(
          "flex flex-col grow items-center justify-around w-full h-[128px] rounded-md",
          "border border-[#DDDAD0] bg-white/70 hover:border-[#1A6CBC] hover:bg-blue-300/80 cursor-pointer",
          addMethod === "remote" && "border-[#1A6CBC] bg-blue-300/60"
        )}
      >
        <div className="flex flex-col text-center items-center p-6">
          <div className="flex items-center gap-x-1">
            <ChainIcon />
            <span>Import a plugin</span>
          </div>
          <div className="h-2" />
          <Body style={{ fontSize: "14px" }}>Import a plugin from an external URL.</Body>
        </div>
      </div>

      <div
        onClick={() => {
          setAddMethod("dev");
        }}
        className={twMerge(
          "flex flex-col grow items-center justify-around w-full h-[128px] rounded-md",
          "border border-[#DDDAD0] bg-white/70 hover:border-[#1A6CBC] hover:bg-blue-300/80 cursor-pointer",
          addMethod === "dev" && "border-[#1A6CBC] bg-blue-300/60"
        )}
      >
        <div className="flex flex-col text-center items-center p-6">
          <div className="flex items-center gap-x-1">
            <TerminalIcon />
            <span>Create plugins locally</span>
          </div>
          <div className="h-2" />
          <Body style={{ fontSize: "14px" }}>Run the Sky Strife plugin dev server on your local machine.</Body>
        </div>
      </div>

      <div className="h-0" />

      <Button
        buttonType="primary"
        disabled={!addMethod}
        onClick={() => {
          if (addMethod === "dev") {
            window.open(PLUGIN_DOCS_URL, "_blank");
            return;
          }

          setChosenAddMethod(addMethod);
        }}
      >
        {addMethod === "dev" ? "Visit docs" : "Import"}
      </Button>
    </>
  );

  const addRemoteForm = <ImportPluginForm setPlugin={setPlugin} setManagerState={setManagerState} />;
  const addDevForm = <div>Not implemented</div>;
  const addForm = addMethod === "remote" ? addRemoteForm : addDevForm;

  return <div className="flex flex-col gap-y-3 grow pb-4">{chosenAddMethod ? addForm : chooseAddMethodForm}</div>;
}
