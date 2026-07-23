// App-local, React-oriented flat config. Deliberately NOT the LIT/legacy player config.
// Encodes the Feature-Sliced Design import boundary: app → platform → features → shared.
// A cross-feature import, an upward import, or a cycle FAILS lint.
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import boundaries from "eslint-plugin-boundaries";
import importPlugin from "eslint-plugin-import";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "public/mockServiceWorker.js", "coverage/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.es2022 },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      boundaries,
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: { project: "./tsconfig.json" },
      },
      "boundaries/include": ["src/**/*"],
      "boundaries/elements": [
        // The Redux store + typed hooks are shared infrastructure every layer may read.
        { type: "store", pattern: ["src/app/store.ts", "src/app/hooks.ts"], mode: "full" },
        { type: "app", pattern: "src/app/*" },
        { type: "platform", pattern: "src/platform/*" },
        { type: "feature", pattern: "src/features/*", capture: ["feature"] },
        { type: "shared", pattern: "src/shared/*" },
        { type: "mocks", pattern: "src/mocks/*" },
      ],
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
      "import/no-cycle": ["error", { maxDepth: 4 }],

      // FSD layering — imports flow app → platform → features → shared. No cross-feature.
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          message: "FSD boundary: ${file.type} may not import ${dependency.type}.",
          rules: [
            { from: "store", allow: ["store", "platform", "shared"] },
            { from: "app", allow: ["app", "store", "platform", "feature", "shared", "mocks"] },
            { from: "platform", allow: ["platform", "shared", "store"] },
            {
              from: "feature",
              allow: ["shared", "store", ["feature", { feature: "${from.feature}" }]],
              message: "Cross-feature imports are not allowed — go through shared/.",
            },
            { from: "shared", allow: ["shared"] },
            { from: "mocks", allow: ["mocks", "shared", "feature"] },
          ],
        },
      ],
    },
  },
  {
    // Design-system primitives co-export variants/utilities beside their component
    // (the standard shadcn pattern) — Fast Refresh granularity is irrelevant here.
    files: ["src/shared/ui/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    // Config and test files run in Node and outside the layered graph.
    files: ["*.{js,mjs,cjs,ts}", "vitest.setup.ts", "**/*.test.{ts,tsx}", "src/**/__tests__/**"],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      "boundaries/element-types": "off",
      "import/no-cycle": "off",
    },
  },
);
