import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";

const configDir = fileURLToPath(new URL(".", import.meta.url));
const authFile = process.env.E2E_AUTH_FILE ?? "playwright/.auth/user.json";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR ?? "test-results",
  reporter: [["html", { open: "never", outputFolder: process.env.PLAYWRIGHT_REPORT_DIR ?? "playwright-report" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "VITE_CACHE_DIR=/tmp/agendoro-vite-cache-e2e node ./node_modules/vite/bin/vite.js --config vite.config.ts --host 127.0.0.1 --port 5173",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
    timeout: 120_000,
    cwd: configDir,
  },
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "public-mobile",
      use: {
        ...devices["iPhone 13"],
        browserName: "chromium",
        storageState: authFile,
      },
      dependencies: ["setup"],
    },
    {
      name: "public-mobile-chromium",
      use: {
        ...devices["Pixel 7"],
        storageState: authFile,
      },
      dependencies: ["setup"],
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: authFile,
      },
      dependencies: ["setup"],
    },
  ],
});
