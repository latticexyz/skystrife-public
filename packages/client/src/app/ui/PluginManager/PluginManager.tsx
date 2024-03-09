import { useCallback, useEffect, useMemo, useState } from "react";
import { ClickWrapper } from "../Theme/ClickWrapper";
import { transpileModule, ModuleKind, ScriptTarget } from "typescript";
import { DateTime } from "luxon";

import { PluginItem } from "./PluginItem";
import useLocalStorageState from "use-local-storage-state";
import { Button } from "../Theme/SkyStrife/Button";
import { PluginData, Plugins } from "./types";
import { ActivePlugins } from "./ActivePlugins";
import { Card } from "../Theme/SkyStrife/Card";
import { PluginIcon } from "../Theme/PluginIcon";
import { Link, OverlineLarge } from "../Theme/SkyStrife/Typography";
import { Input } from "../Theme/SkyStrife/Input";

import frenzyCode from "plugins/dev/frenzy?raw";
import uiExampleCode from "plugins/dev/uiExample?raw";
import playerDetailsCode from "plugins/dev/playerDetails?raw";
import { DocsIcon } from "./DocsIcon";
import { CrossIcon } from "../Theme/CrossIcon";

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
  const [lastRefreshedPlugin, setLastRefreshedPlugin] = useState<{
    pluginKey: string;
    time: number;
  } | null>(null);
  const lastRefreshedText = useMemo(() => {
    if (!lastRefreshedPlugin) return "Never";
    // format time as just hour and minute
    return DateTime.fromMillis(lastRefreshedPlugin.time).toLocaleString(DateTime.TIME_SIMPLE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastRefreshedPlugin]);

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

  const refreshPlugin = useCallback(
    async (pluginPath: string) => {
      fetch(`${PLUGIN_DEV_SERVER_URL}/${pluginPath}`)
        .then((res) => res.text())
        .then((tsCode) => {
          const jsCode = convertTsPluginToJs(tsCode);
          setPlugin(pluginPath, {
            code: jsCode,
            source: "dev-server",
          });

          setLastRefreshedPlugin({ pluginKey: pluginPath, time: Date.now() });
        });
    },
    [setPlugin]
  );

  const refreshDevPlugins = useCallback(async () => {
    fetch(`${PLUGIN_DEV_SERVER_URL}/list`)
      .then((res) => res.json())
      .then((fileList: string[]) => {
        fileList.forEach((file) => {
          if (file.endsWith(".ts")) {
            refreshPlugin(file);
          }
        });
      });
  }, [refreshPlugin]);

  useEffect(() => {
    refreshDevPlugins();
    if (!plugins["Frenzy"]) setPlugin("Frenzy", { code: convertTsPluginToJs(frenzyCode), source: "official" });
    if (!plugins["Example Plugin"])
      setPlugin("Example Plugin", { code: convertTsPluginToJs(uiExampleCode), source: "official" });
    if (!plugins["Player Details"])
      setPlugin("Player Details", { code: convertTsPluginToJs(playerDetailsCode), source: "official" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:1993");
    ws.onopen = function () {
      console.log("Plugin Dev Server connected.");
      setDevServerConnected(true);
    };

    ws.onmessage = function (e) {
      const message = JSON.parse(e.data);
      console.log(`File changed: ${message.path}, Event Type: ${message.eventType}`);
      if (message.path) refreshPlugin(message.path);
    };

    ws.onerror = function (e) {
      console.error("WebSocket Error: ", e);
    };

    ws.onclose = function (e) {
      console.log("WebSocket connection closed", e);
      setDevServerConnected(false);
    };
  }, [refreshPlugin]);

  const pluginList = useMemo(() => {
    if (Object.keys(plugins).length === 0) {
      return (
        <>
          <div
            style={{
              border: "1px solid #DDDAD0",
              background: "#F4F3F1",
              borderRadius: "2px",
            }}
            className="text-ss-text-light text-center grow flex flex-col justify-around"
          >
            <p>
              <span>No plugins found</span>
              <div onClick={() => setManagerState("adding")}>
                <Link>Add your first plugin</Link>
              </div>
            </p>
          </div>

          <div className="h-6" />
        </>
      );
    }

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
          backgroundColor: "rgba(244, 243, 241, 0.8)",
          backdropFilter: "blur(10px)",
          width: showManager ? "384px" : "0",
          transition: "width 0.3s",
          right: showManager ? "0" : "-34px",
          zIndex: 1000,
        }}
        className="fixed right-0 top-0 h-full border-l-2 border-black p-4 flex flex-col w-full"
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
              <div className="shrink-0">Dev Server Connected</div>
              <div className="w-4 h-4 bg-green-500 rounded-full shrink-0" />

              <div className="flex-grow" />

              {lastRefreshedPlugin && (
                <div className="text-sm text-ss-text-light text-right">
                  Last Refreshed:
                  <br />
                  {lastRefreshedPlugin.pluginKey}
                  <br />
                  {lastRefreshedText}
                </div>
              )}
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
                        setPlugin(newPluginName, { code: jsCode, source: "remote" });
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

        <div className="w-full flex gap-x-2">
          <Button buttonType="tertiary" className="p-1 px-2 grow" onClick={() => setShowManager(false)}>
            <div className="w-full flex items-center gap-x-1">
              <CrossIcon />
              <span>Close</span>
            </div>
          </Button>

          <a className="grow" href="https://github.com/latticexyz/skystrife-public/tree/main/packages/plugins">
            <Button buttonType="tertiary" className="p-1 px-2 w-full">
              <div className="w-full flex items-center gap-x-1">
                <DocsIcon /> <span>Docs</span>
              </div>
            </Button>
          </a>
        </div>
      </ClickWrapper>
    </>
  );
}
