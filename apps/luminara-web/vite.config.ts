import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

// Luminara host dev server runs on 5174 (playground keeps 5173). Same Chromium-60
// legacy floor as the rest of the monorepo — the embedded Prize Quest module must
// still run on EGM cabinet browsers when this host is repurposed for a kiosk.
export default defineConfig({
  server: { port: 5174 },
  plugins: [
    legacy({
      targets: ['chrome >= 60', 'safari >= 11', 'firefox esr'],
      modernPolyfills: true,
    }),
  ],
});
