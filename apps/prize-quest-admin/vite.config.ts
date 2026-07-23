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
  build: {
    rollupOptions: {
      output: {
        // Split heavy, rarely-changing vendors into their own long-lived chunks
        // so a feature edit doesn't bust the whole cache, and the charting/table
        // weight only downloads on surfaces that use it (via the lazy routes).
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("recharts") || id.includes("d3-") || id.includes("victory-vendor"))
            return "vendor-charts";
          if (id.includes("@tanstack")) return "vendor-table";
          if (id.includes("@radix-ui")) return "vendor-radix";
          if (id.includes("@reduxjs") || id.includes("react-redux") || id.includes("immer"))
            return "vendor-redux";
          if (
            id.includes("react-router") ||
            id.includes("/react-dom/") ||
            id.includes("/react/") ||
            id.includes("/scheduler/")
          )
            return "vendor-react";
          return undefined;
        },
      },
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
