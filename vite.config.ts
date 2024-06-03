import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  base: "",
  plugins: [
    svgr(),
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
      external: ["browser-polyfill"],
    },
  },
  resolve: {
    alias: {
      screens: "/src/screens",
      hooks: "/src/hooks",
      layout: "/src/layout",
      assets: "/src/assets",
      common: "/src/common",
      background: "/src/background",
    },
  }
});
