import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";

const configDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  testDir: "./e2e",
  testMatch: /onboarding-videos\.spec\.ts/,
  outputDir: "/tmp/agendoro-playwright-onboarding-results",
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:5181",
    video: "on",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    ...devices["Desktop Chrome"],
    storageState: {
      cookies: [],
      origins: [{
        origin: "http://127.0.0.1:5181",
        localStorage: [{ name: "agendoro:token", value: "onboarding-video-token" }],
      }],
    },
  },
  webServer: {
    command: "node ./node_modules/vite/bin/vite.js --configLoader runner --host 127.0.0.1 --port 5181",
    url: "http://127.0.0.1:5181",
    reuseExistingServer: false,
    timeout: 120_000,
    cwd: configDir,
  },
});
