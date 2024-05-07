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

import frenzyCode from "plugins/dev/frenzy?raw";
import uiExampleCode from "plugins/dev/uiExample?raw";
import playerDetailsCode from "plugins/dev/playerDetails?raw";
import opponentGoldCode from "plugins/dev/opponentGold?raw";
import actionLogCode from "plugins/dev/actionLog?raw";

import { DocsIcon } from "./DocsIcon";
import { CrossIcon } from "../Theme/CrossIcon";
import { AddPlugin } from "./AddPlugin";
import { useMUD } from "../../../useMUD";
import { skystrifeDebug } from "../../../debug";

const PLUGIN_DEV_SERVER_URL = "http://localhost:1993";
export const PLUGIN_DOCS_URL = "https://github.com/latticexyz/skystrife-public/tree/main/packages/plugins/README.md";

export function convertTsPluginToJs(tsCode: string) {
  const jsOutput = transpileModule(tsCode.replace(/import.*?;/g, ""), {
    compilerOptions: { module: ModuleKind.ES2015, target: ScriptTarget.ES2015 },
  });
  return jsOutput.outputText;
}

const debug = skystrifeDebug.extend("plugin-manager");

export function PluginManager() {
  const {
    networkLayer: {
      utils: { sendAnalyticsEvent },
    },
  } = useMUD();

  const [plugins, setPlugins] = useLocalStorageState<Plugins>("plugins", {
    defaultValue: {},
  });
  const [deletedOfficialPlugins, setDeletedOfficialPlugins] = useLocalStorageState<string[]>("deletedOfficialPlugins", {
    defaultValue: [],
  });
  const [showManager, setShowManager] = useState(false);
  const [managerState, setManagerState] = useState<"open" | "adding">("open");

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
    [setPlugins],
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
    [setPlugin],
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

    const officialPlugins = [
      ["Frenzy v0.2", frenzyCode, true, 24, 160],
      ["UI Example", uiExampleCode, false, 0, 0],
      ["Player Details", playerDetailsCode, false, 0, 0],
      ["Opponent Gold", opponentGoldCode, true, 24, 320],
      ["Action Log", actionLogCode, false, 0, 0],
    ] as const;

    officialPlugins.forEach(([pluginName, code, active, x, y]) => {
      if (!deletedOfficialPlugins.includes(pluginName) && !plugins[pluginName]) {
        setPlugins((plugins) => {
          return {
            ...plugins,
            [pluginName]: {
              active,
              code: convertTsPluginToJs(code),
              x,
              y,
              source: "official",
            },
          };
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  useEffect(() => {
    try {
      if (!showManager) {
        wsConnection?.close();
        return;
      }

      debug("Connecting to plugin dev server...");
      const ws = new WebSocket("ws://localhost:1993");
      setWsConnection(ws);
      ws.onopen = function () {
        debug("Plugin Dev Server connected.");
        setDevServerConnected(true);
      };

      ws.onmessage = function (e) {
        const message = JSON.parse(e.data);
        debug(`File changed: ${message.path}, Event Type: ${message.eventType}`);
        if (message.path) {
          // force an unmount
          setPlugin(message.path, {
            active: false,
          });
          refreshPlugin(message.path);
        }
      };

      ws.onerror = function (e) {
        console.error("WebSocket Error: ", e);
      };

      ws.onclose = function (e) {
        setDevServerConnected(false);
      };
    } catch (e) {
      console.warn("No plugin dev server connected.");
    }

    return () => {
      wsConnection?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showManager]);

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
            <div>
              <span>No plugins found</span>
              <div onClick={() => setManagerState("adding")}>
                <Link>Add your first plugin</Link>
              </div>
            </div>
          </div>

          <div className="h-6 shrink-0" />
        </>
      );
    }

    return (
      <div className="grow relative overflow-y-auto w-full">
        <div className="absolute h-full w-full">
          {Object.entries(plugins).map(([key, value]) => {
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
          })}
        </div>
      </div>
    );
  }, [plugins, setPlugin, setPlugins]);

  return (
    <>
      <ActivePlugins plugins={plugins} setPlugin={setPlugin} />

      <ClickWrapper
        onClick={() => {
          setShowManager(true);
          sendAnalyticsEvent("plugin-manager-toggle", {
            active: true,
          });
        }}
      >
        <Card primary className="w-[40px] h-[40px] p-2 cursor-pointer">
          <div className="flex flex-row items-center">
            <PluginIcon />
          </div>
        </Card>
      </ClickWrapper>

      <ClickWrapper
        style={{
          backgroundColor: "rgba(244, 243, 241, 0.6)",
          backdropFilter: "blur(6px)",
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
                setManagerState("open");
              }}
            >
              Go Back
            </Button>
          )}
        </div>

        {devServerConnected && (
          <>
            <div className="h-6 shrink-0" />

            <div className="flex items-center shrink-0 gap-x-2">
              <div className="shrink-0">Dev Server Status</div>
              <div className="w-4 h-4 bg-green-500 rounded-full shrink-0" />

              <div className="grow" />

              {lastRefreshedPlugin && (
                <div className="text-xs text-ss-text-light text-right">
                  Last Refreshed:
                  <br />
                  {lastRefreshedPlugin.pluginKey} at {lastRefreshedText}
                  <br />
                </div>
              )}
            </div>
          </>
        )}

        <div className="h-6 shrink-0" />

        <div className="flex flex-col gap-y-2 grow">
          {managerState === "open" && pluginList}
          {managerState === "adding" && <AddPlugin setPlugin={setPlugin} setManagerState={setManagerState} />}
        </div>

        <div className="h-6 shrink-0" />

        <div className="w-full flex gap-x-2 shrink-0">
          <Button
            buttonType="tertiary"
            className="p-1 px-2 grow"
            onClick={() => {
              setShowManager(false);
              sendAnalyticsEvent("plugin-manager-toggle", {
                active: false,
              });
            }}
          >
            <div className="w-full flex items-center gap-x-1">
              <CrossIcon />
              <span>Close</span>
            </div>
          </Button>

          <a className="grow" href={PLUGIN_DOCS_URL}>
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
