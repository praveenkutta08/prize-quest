// @pq/eslint-config — shared ESLint flat config for the Prize Quest workspace.
// Consumed by the repo-root eslint.config.mjs. One repo-wide pass enforces
// the same rules (incl. cross-package import boundaries) everywhere.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/storybook-static/**",
      "**/.vite/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { import: importPlugin },
    rules: {
      // Honor the `_`-prefix convention for intentionally-unused args/vars.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],

      // --- Import-boundary rules (mirrors CDP-UI governance) ---
      // No circular dependencies between modules/packages.
      // Start as "warn" so it doesn't block CI on day one; promote to "error".
      "import/no-cycle": ["warn", { maxDepth: 1 }],

      // Forbid deep imports into another widget package's internals.
      // Cross-package imports must go through the package entry point.
      // (Bare package specifiers like "@pq/pq-progress-bar" are allowed;
      //  reaching into "@pq/pq-progress-bar/src/..." is not.)
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@pq/*/src/*", "@pq/*/dist/*"],
              message:
                "Import from the package entry point (its index), not its internals.",
            },
          ],
        },
      ],
    },
  },
  {
    // Build/test config files run in Node (process, __dirname, etc.).
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    // Chai's expressive assertions read as unused expressions; mocha globals.
    files: ["**/tests/**/*.ts"],
    languageOptions: {
      globals: { ...globals.mocha },
    },
    rules: {
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
);
