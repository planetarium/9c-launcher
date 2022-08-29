import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      src: "./src",
    },
  },
  rollupOptions: {
    external: ["electron", "spawn-sync"],
    output: {
      globals: {
        "spawn-sync": "require('child_process').spawnSync",
      },
    },
  },
  test: {
    testTimeout: 30_000,
    hookTimeout: 30_000,
    environment: "node",
  },
});
