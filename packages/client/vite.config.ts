import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "src",
  server: {
    port: 3000,
    fs: {
      strict: false,
    },
  },
  preview: {
    port: 3000,
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    sourcemap: false,
    assetsInlineLimit: 0,
    target: "es2022",
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: ["@safe-globalThis/safe-apps-provider", "@safe-globalThis/safe-apps-sdk"],
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          phaser: ["phaser"],
          mud: [
            "ecs-browser",
            "@latticexyz/block-logs-stream",
            "@latticexyz/common",
            "@latticexyz/dev-tools",
            "@latticexyz/react",
            "@latticexyz/recs",
            "@latticexyz/schema-type",
            "@latticexyz/store",
            "@latticexyz/store-sync",
            "@latticexyz/utils",
            "@latticexyz/world",
          ],
        },
      },
    },
  },
  define: {
    global: "globalThis",
  },
});
