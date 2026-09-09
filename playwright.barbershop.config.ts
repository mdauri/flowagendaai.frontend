import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e", testMatch: "barbershop-sales.spec.ts", workers: 1,
  timeout: 60000, expect: { timeout: 15000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: process.env.PLAYWRIGHT_REPORT_DIR ?? "/tmp/agendoro-barbershop-report" }]],
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR ?? "/tmp/agendoro-barbershop-results",
  use: { baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5176", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [ { name: "desktop", use: { ...devices["Desktop Chrome"] } }, { name: "mobile", use: { ...devices["Pixel 7"] } } ],
});
