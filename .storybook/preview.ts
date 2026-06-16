import type { Preview } from "@storybook/web-components-vite";

// Load the global fonts (Manrope / Inter / IBM Plex Mono / Cormorant Garamond)
// into every story, the same stylesheet the playground app uses.
import "../apps/playground/src/global.css";

const preview: Preview = {
  decorators: [(story) => story()],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: { order: ["Welcome", "Widgets", "*"] },
    },
  },
};

export default preview;
