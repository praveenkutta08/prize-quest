import type { StorybookConfig } from "@storybook/web-components-vite";

const config: StorybookConfig = {
  // No widgets yet — the widgets glob matches once packages/widgets/*/stories/ exist.
  // The Welcome page keeps Storybook loading cleanly in the meantime.
  stories: [
    "./Welcome.mdx",
    "../packages/widgets/**/stories/*.stories.ts",
  ],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/web-components-vite",
    options: {},
  },
};

export default config;
