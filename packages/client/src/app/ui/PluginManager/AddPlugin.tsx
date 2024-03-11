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
  } = useMUD();

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
        disabled={!newPluginName || !pluginUrl}
        onClick={() => {
          if (!newPluginName) {
            setNewPluginError("Plugin name is required");
            return;
          }

          if (!pluginUrl) {
            setNewPluginError("Plugin URL is required");
            return;
          }

          fetch(pluginUrl)
            .then((res) => res.text())
            .then((code) => {
              try {
                const jsCode = convertTsPluginToJs(code);
                setPlugin(newPluginName, { code: jsCode, source: "remote" });
                setNewPluginName("");
                setPluginUrl("");
                setNewPluginError(null);
                setManagerState("open");

                sendAnalyticsEvent("plugin-add", {
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
        }}
      >
        Add
      </Button>

      {newPluginError && <div className="text-red-600 w-full text-center">{newPluginError}</div>}
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
          "border border-[#DDDAD0] bg-white hover:border-[#1A6CBC] hover:bg-blue-300/30 cursor-pointer",
          addMethod === "remote" && "border-[#1A6CBC] bg-blue-300/30"
        )}
      >
        <div className="flex flex-col text-center items-center p-6">
          <div className="flex items-center gap-x-1">
            <ChainIcon />
            <span>Import a plugin</span>
          </div>
          <div className="h-2" />
          <Body style={{ fontSize: "12px" }}>Import a plugin from an external URL.</Body>
        </div>
      </div>

      <div
        onClick={() => {
          setAddMethod("dev");
        }}
        className={twMerge(
          "flex flex-col grow items-center justify-around w-full h-[128px] rounded-md",
          "border border-[#DDDAD0] bg-white hover:border-[#1A6CBC] hover:bg-blue-300/30 cursor-pointer",
          addMethod === "dev" && "border-[#1A6CBC] bg-blue-300/30"
        )}
      >
        <div className="flex flex-col text-center items-center p-6">
          <div className="flex items-center gap-x-1">
            <TerminalIcon />
            <span>Create plugins locally</span>
          </div>
          <div className="h-2" />
          <Body style={{ fontSize: "12px" }}>Run the Sky Strife plugin dev server on your local machine.</Body>
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
