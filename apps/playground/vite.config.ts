import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

// Chromium 60 / Safari 11 / Firefox ESR 60 floor — embedded EGM cabinet browsers.
// plugin-legacy emits legacy (ES5) chunks + polyfills alongside modern output and
// injects the nomodule fallback so old Chromium loads the transpiled bundle.
export default defineConfig({
  plugins: [
    legacy({
      targets: ['chrome >= 60', 'safari >= 11', 'firefox esr'],
      modernPolyfills: true,
    }),
  ],
});
