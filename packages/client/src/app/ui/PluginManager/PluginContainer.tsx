import React, { forwardRef, ForwardRefRenderFunction, useState } from "react";
import { Rnd } from "react-rnd";
import { CrossIcon } from "../Theme/CrossIcon";
import color from "color";
import { twMerge } from "tailwind-merge";
import { PluginData, PluginError } from "./types";
import { useMUD } from "../../../useMUD";

type PluginContainerProps = React.HTMLProps<HTMLDivElement> & {
  pluginKey: string;
  pluginData: PluginData;
  setPlugin: (pluginKey: string, data: Partial<PluginData>) => void;
  pluginError: PluginError;
};

const PluginContainer: ForwardRefRenderFunction<HTMLDivElement, PluginContainerProps> = (props, ref) => {
  const {
    networkLayer: {
      utils: { sendAnalyticsEvent },
    },
    phaserLayer: {
      api: {
        mapInteraction: { disableMapInteraction, enableMapInteraction },
      },
    },
  } = useMUD();

  const { pluginKey, pluginData, setPlugin, pluginError, ...rest } = props;
  const { minimized, x, y } = pluginData;
  const location = { x, y };

  const [dragging, setDragging] = useState(false);

  return (
    <Rnd
      className={twMerge(
        "rounded border overflow-clip border-black p-2 pointer-events-auto",
        pluginData.minimized && "pb-0"
      )}
      style={{
        backgroundColor: color("white").alpha(0.5).string(),
        backdropFilter: "blur(4px)",
      }}
      dragHandleClassName="dragger"
      enableResizing={false}
      maxWidth={minimized ? 200 : 1000}
      position={{ x: location.x ?? 0, y: location.y ?? 0 }}
      onDragStop={(e, d) => {
        setPlugin(pluginKey, { x: d.x, y: d.y });
        enableMapInteraction(pluginKey);
        setDragging(false);
      }}
      onDragStart={() => {
        disableMapInteraction(pluginKey);
        setDragging(true);
        sendAnalyticsEvent("plugin-drag", {
          pluginKey,
          ...pluginData,
        });
      }}
      dragGrid={[8, 8]}
    >
      <div
        className={twMerge(
          "flex flex-row items-center dragger justify-between border-b border-black -mx-2 p-1 px-2 cursor-move -mt-2 overflow-hidden mb-2 gap-x-8 bg-ss-bg-1",
          minimized && "mb-0 border-0"
        )}
      >
        <h1 className="grow overflow-hidden whitespace-nowrap text-ellipsis">{pluginKey}</h1>

        <div className="flex gap-x-2 items-center">
          <button
            className="cursor-pointer text-2xl w-8 align-middle"
            onClick={() => {
              const newMinimized = !minimized;
              setPlugin(pluginKey, {
                minimized: newMinimized,
              });
              sendAnalyticsEvent("plugin-minimize-toggle", {
                pluginKey,
                ...pluginData,
                minimized: newMinimized,
              });
            }}
          >
            {minimized ? "+" : "-"}
          </button>

          <button
            className="cursor-pointer"
            onClick={() => {
              setPlugin(pluginKey, {
                active: false,
              });
              sendAnalyticsEvent("plugin-toggle", {
                pluginKey,
                ...pluginData,
                active: false,
              });
            }}
          >
            <CrossIcon />
          </button>
        </div>
      </div>

      <div
        onMouseOver={() => {
          if (!dragging) {
            disableMapInteraction(`${pluginKey}-mouseover`);
          }
        }}
        onMouseOut={() => {
          if (!dragging) {
            enableMapInteraction(`${pluginKey}-mouseover`);
          }
        }}
        {...rest}
        style={{
          maxHeight: minimized ? 0 : "600px",
          height: "auto",
          overflow: "hidden",
          pointerEvents: "auto",
        }}
        ref={ref}
      >
        {props.children}
      </div>

      {pluginError.error && (
        <div className="text-red-600 text-xs">
          <div className="flex gap-x-1 items-center">
            <span>Plugin failed during: </span> <pre>{pluginError.type}</pre>
          </div>
          <pre className="bg-black p-2">{pluginError.error?.message}</pre>
        </div>
      )}
    </Rnd>
  );
};

export default forwardRef(PluginContainer);
