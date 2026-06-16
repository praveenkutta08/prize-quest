import { esbuildPlugin } from "@web/dev-server-esbuild";
import { chromeLauncher } from "@web/test-runner-chrome";

const executablePath =
  process.env.CHROME_BIN ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

export default {
  files: "tests/**/*.test.ts",
  nodeResolve: true,
  plugins: [esbuildPlugin({ ts: true, target: "es2020" })],
  browsers: [
    chromeLauncher({
      launchOptions: {
        executablePath,
        headless: true,
        args: ["--no-sandbox", "--disable-gpu"],
      },
    }),
  ],
  testFramework: { config: { timeout: 5000 } },
};
