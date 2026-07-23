import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// The admin console runs its own modern toolchain — no @vitejs/plugin-legacy.
// Desktop-only (current Chrome/Edge/Safari); the player side's Chromium-60 build does not apply here.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5177,
    strictPort: false,
  },
  preview: {
    port: 5177,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    css: true,
  },
});
