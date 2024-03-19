import { useCallback, useEffect, useRef, useState } from "react";
import { createPluginLayer } from "../../../layers/Plugins/createPluginLayer";
import PluginContainer from "./PluginContainer";
import { PluginData, PluginError } from "./types";
import { useMUD } from "../../../useMUD";
import { render } from "preact";

export function ActivePlugin({
  pluginKey,
  pluginData,
  setPlugin,
}: {
  pluginKey: string;
  pluginData: PluginData;
  setPlugin: (pluginKey: string, data: Partial<PluginData>) => void;
}) {
  const { phaserLayer } = useMUD();
  const { active, code: pluginCode } = pluginData;
  const [pluginError, setPluginError] = useState<PluginError>({
    type: "none",
    error: null,
  });

  const pluginContainerRef = useRef(null);
  const [cleanedUpPreact, setCleanedUpPreact] = useState(false);

  const constructPlugin = useCallback(() => {
    if (!pluginCode) return;

    try {
      const pluginLayer = createPluginLayer(phaserLayer, pluginKey);
      const createPlugin = eval(`(${pluginCode})`);
      const plugin = createPlugin(pluginLayer);
      return plugin;
    } catch (e) {
      console.error(e);
      setPluginError({
        type: "create",
        error: e as Error,
      });
      return;
    }
  }, [phaserLayer, pluginCode, pluginKey]);

  useEffect(() => {
    if (active) setCleanedUpPreact(false);
  }, [active]);

  useEffect(() => {
    if (!active && !cleanedUpPreact && pluginContainerRef.current) {
      render(null, pluginContainerRef.current);
      setCleanedUpPreact(true);
    }
  }, [active, cleanedUpPreact]);

  useEffect(() => {
    const plugin = constructPlugin();

    if (!active && cleanedUpPreact) {
      try {
        plugin?.unmount();
        setPluginError({
          type: "none",
          error: null,
        });
      } catch (e) {
        console.error(e);
        setPluginError({
          type: "unmount",
          error: e as Error,
        });
      }
    }

    if (active && pluginContainerRef.current) {
      try {
        plugin?.mount(pluginContainerRef.current);
      } catch (e) {
        console.error(e);
        setPluginError({
          type: "mount",
          error: e as Error,
        });
      }
    }

    return () => {
      try {
        plugin?.unmount();
        setPluginError({
          type: "none",
          error: null,
        });
      } catch (e) {
        console.error(e);
        setPluginError({
          type: "unmount",
          error: e as Error,
        });
      }
    };
  }, [active, cleanedUpPreact, constructPlugin]);

  if (!active && cleanedUpPreact) return null;

  return (
    <PluginContainer
      pluginKey={pluginKey}
      pluginData={pluginData}
      setPlugin={setPlugin}
      ref={pluginContainerRef}
      pluginError={pluginError}
    ></PluginContainer>
  );
}
