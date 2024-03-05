import { useCallback, useEffect, useMemo, useState } from "react";
import { ClickWrapper } from "../Theme/ClickWrapper";
import { transpileModule, ModuleKind, ScriptTarget } from "typescript";

import { PluginItem } from "./PluginItem";
import useLocalStorageState from "use-local-storage-state";
import { Button } from "../Theme/SkyStrife/Button";
import { PluginData, Plugins } from "./types";
import { ActivePlugins } from "./ActivePlugins";
import { Card } from "../Theme/SkyStrife/Card";
import { PluginIcon } from "../Theme/PluginIcon";
import { OverlineLarge } from "../Theme/SkyStrife/Typography";
import { Input } from "../Theme/SkyStrife/Input";

import frenzyCode from "plugins/dev/frenzy?raw";
import simpleExampleCode from "plugins/dev/simpleExample?raw";
import playerDetailsCode from "plugins/dev/playerDetails?raw";

const PLUGIN_DEV_SERVER_URL = "http://localhost:1993";

function convertTsPluginToJs(tsCode: string) {
  const jsOutput = transpileModule(tsCode.replace(/import.*?;/g, ""), {
    compilerOptions: { module: ModuleKind.ES2015, target: ScriptTarget.ES2015 },
  });
  return jsOutput.outputText;
}

export function PluginManager() {
  const [plugins, setPlugins] = useLocalStorageState<Plugins>("plugins", {
    defaultValue: {},
  });
  const [showManager, setShowManager] = useState(false);
  const [managerState, setManagerState] = useState<"open" | "adding">("open");
  const [newPluginName, setNewPluginName] = useState("");
  const [pluginUrl, setPluginUrl] = useState("");
  const [newPluginError, setNewPluginError] = useState<string | null>(null);
  const [devServerConnected, setDevServerConnected] = useState(false);

  const setPlugin = useCallback(
    (pluginKey: string, data: Partial<PluginData>) => {
      setPlugins((plugins) => {
        const oldPlugin = plugins[pluginKey];
        const newPlugins = { ...plugins };
        newPlugins[pluginKey] = { ...oldPlugin, ...data };
        return newPlugins;
      });
    },
    [setPlugins]
  );

  const refreshDevPlugins = useCallback(async () => {
    fetch(`${PLUGIN_DEV_SERVER_URL}/list`)
      .then((res) => res.json())
      .then((fileList: string[]) => {
        fileList.forEach((file) => {
          if (file.endsWith(".ts")) {
            fetch(`${PLUGIN_DEV_SERVER_URL}/${file}`)
              .then((res) => res.text())
              .then((tsCode) => {
                const jsCode = convertTsPluginToJs(tsCode);
                setPlugin(file, {
                  code: jsCode,
                });
              });
          }

          setDevServerConnected(true);
        });
      })
      .catch(() => {
        setDevServerConnected(false);
      });
  }, [setPlugin]);

  useEffect(() => {
    refreshDevPlugins();
    if (!plugins["Frenzy"]) setPlugin("Frenzy", { code: convertTsPluginToJs(frenzyCode) });
    if (!plugins["Example Plugin"]) setPlugin("Example Plugin", { code: convertTsPluginToJs(simpleExampleCode) });
    if (!plugins["Player Details"]) setPlugin("Player Details", { code: convertTsPluginToJs(playerDetailsCode) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pluginList = useMemo(() => {
    return Object.entries(plugins).map(([key, value]) => {
      return (
        <PluginItem
          key={key}
          plugins={plugins}
          pluginKey={key}
          pluginData={value}
          setPlugin={setPlugin}
          deletePlugin={() => {
            const newPlugins = { ...plugins };
            delete newPlugins[key];
            setPlugins(newPlugins);
          }}
        />
      );
    });
  }, [plugins, setPlugin, setPlugins]);

  return (
    <>
      <ActivePlugins plugins={plugins} setPlugin={setPlugin} />

      <ClickWrapper onClick={() => setShowManager(true)}>
        <Card primary className="w-[40px] h-[40px] p-2 cursor-pointer">
          <div className="flex flex-row items-center">
            <PluginIcon />
          </div>
        </Card>
      </ClickWrapper>

      <ClickWrapper
        style={{
          backgroundColor: "rgba(244, 243, 241, 1)",
          width: showManager ? "384px" : "0",
          transition: "width 0.3s",
          right: showManager ? "0" : "-34px",
          zIndex: 1000,
        }}
        className="fixed right-0 top-0 h-full border-l-2 border-black p-4 flex flex-col"
      >
        <div className="flex items-center">
          <OverlineLarge>Plugin Manager</OverlineLarge>

          <div className="flex-grow" />

          {managerState === "open" && (
            <Button
              buttonType="secondary"
              onClick={() => {
                setManagerState("adding");
              }}
            >
              + Add Plugin
            </Button>
          )}

          {managerState === "adding" && (
            <Button
              buttonType="tertiary"
              onClick={() => {
                setNewPluginName("");
                setPluginUrl("");
                setNewPluginError(null);
                setManagerState("open");
              }}
            >
              Go Back
            </Button>
          )}
        </div>

        {devServerConnected && (
          <>
            <div className="h-6" />

            <div className="flex items-center gap-x-2">
              <div>Dev Server Connected</div>
              <div className="w-4 h-4 bg-green-500 rounded-full" />

              <div className="flex-grow" />

              <Button buttonType="tertiary" onClick={refreshDevPlugins}>
                Refresh
              </Button>
            </div>
          </>
        )}

        <div className="h-6" />

        <div className="flex flex-col gap-y-2 grow">
          {managerState === "open" && pluginList}
          {managerState === "adding" && (
            <div className="flex flex-col gap-y-2">
              <Input label="Plugin Name" value={newPluginName} setValue={setNewPluginName} />

              <Input label="Plugin URL" value={pluginUrl} setValue={setPluginUrl} />

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
                        setPlugin(newPluginName, { code: jsCode });
                        setNewPluginName("");
                        setPluginUrl("");
                        setNewPluginError(null);
                        setManagerState("open");
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
          )}
        </div>

        <Button buttonType="tertiary" className="p-1 px-2" onClick={() => setShowManager(false)}>
          Close
        </Button>
      </ClickWrapper>
    </>
  );
}
