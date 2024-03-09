export type Plugins = {
  [key: string]: PluginData;
};

export type PluginData = {
  code: string;
  active?: boolean;
  x?: number;
  y?: number;
  minimized?: boolean;
  source?: "official" | "dev-server" | "remote";
};

export type PluginError = {
  type: "none" | "mount" | "unmount" | "create";
  error: Error | null;
};
