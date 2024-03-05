export type Plugins = {
  [key: string]: PluginData;
};

export type PluginData = {
  code: string;
  active?: boolean;
  x?: number;
  y?: number;
  minimized?: boolean;
};

export type PluginError = {
  type: "none" | "mount" | "unmount" | "create";
  error: Error | null;
};
