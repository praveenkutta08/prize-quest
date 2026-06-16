import { defineConfig } from "vite";
import legacy from "@vitejs/plugin-legacy";

// Kiosk Arcade demo runs at port 5176 (playground 5173, luminara-web 5174,
// ttd-synkros 5175). Chromium 60 is the kiosk/EGM browser floor.
//
// VITE_PROD_BUILD gates the dev chrome (3-switcher): set it true for a production
// build (`VITE_PROD_BUILD=true pnpm build`) and the switcher is removed; device
// dimensions then come from a runtime config (?device= param / env).
const prodBuild = process.env.VITE_PROD_BUILD === "true";

export default defineConfig({
  server: { port: 5176 },
  define: {
    "import.meta.env.VITE_PROD_BUILD": JSON.stringify(prodBuild),
  },
  plugins: [
    legacy({
      targets: ["chrome >= 60", "safari >= 11", "firefox esr"],
      modernPolyfills: true,
    }),
  ],
});
