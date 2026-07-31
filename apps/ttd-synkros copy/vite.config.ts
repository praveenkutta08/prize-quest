import { defineConfig } from "vite";
import legacy from "@vitejs/plugin-legacy";

// SYNKROS TTD demo runs at port 5175 (playground 5173, luminara-web 5174).
// Chromium 60 floor is the real constraint here — TTD cabinet browsers are the
// oldest target in the fleet.
export default defineConfig({
  server: { port: 5175 },
  plugins: [
    legacy({
      targets: ["chrome >= 60", "safari >= 11", "firefox esr"],
      modernPolyfills: true,
    }),
  ],
});
