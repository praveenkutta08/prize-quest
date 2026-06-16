import { esbuildPlugin } from "@web/dev-server-esbuild";
import { chromeLauncher } from "@web/test-runner-chrome";

const executablePath =
  process.env.CHROME_BIN ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

export default {
  // nanostores reads process.env.NODE_ENV at init; the browser has no `process`.
  testRunnerHtml: (testFramework) =>
    `<!DOCTYPE html><html><head><script>globalThis.process={env:{NODE_ENV:"production"}};</script></head><body><script type="module" src="${testFramework}"></script></body></html>`,
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
