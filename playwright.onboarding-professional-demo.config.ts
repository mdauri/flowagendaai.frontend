import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";

const frontendDir = fileURLToPath(new URL(".", import.meta.url));
const apiDir = "/home/dauri/Projects/worktrees/flowagendaai/onboarding-guiado-ativacao/api";
const databaseUrl = "postgresql://agendoro_user:Ag3nd0r0!Secure2026@127.0.0.1:5432/agendoro?schema=public";

export default defineConfig({
  testDir: "./e2e",
  testMatch: /onboarding-professional-demo\.spec\.ts/,
  outputDir: "./test-results/onboarding-professional-poc",
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:5173",
    viewport: { width: 1280, height: 720 },
    video: { mode: "on", size: { width: 1280, height: 720 } },
    trace: "off",
    screenshot: "off",
    ...devices["Desktop Chrome"],
  },
  webServer: [
    {
      command: `DATABASE_URL='${databaseUrl}' JWT_SECRET='onboarding-professional-demo-secret' NODE_ENV=test PORT=3333 npx tsx src/server.ts`,
      url: "http://127.0.0.1:3333/health/live",
      cwd: apiDir,
      timeout: 120_000,
      reuseExistingServer: false,
    },
    {
      command: "node ./node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173",
      url: "http://127.0.0.1:5173",
      cwd: frontendDir,
      timeout: 120_000,
      reuseExistingServer: false,
    },
  ],
});
