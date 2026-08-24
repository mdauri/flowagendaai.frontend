import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const resultsDir = "/tmp/agendoro-playwright-onboarding-results";
const outputDir = path.join(root, "public", "onboarding-videos");
const videoKeys = [
  "company-data",
  "business-hours",
  "first-professional",
  "first-service",
  "appearance",
  "notifications",
  "test-booking",
  "publish",
];

fs.mkdirSync(outputDir, { recursive: true });
for (const entry of fs.readdirSync(outputDir)) {
  if (entry.endsWith(".webm")) {
    fs.rmSync(path.join(outputDir, entry), { force: true });
  }
}
fs.rmSync(resultsDir, { recursive: true, force: true });

const runner = spawnSync("npx", [
  "playwright",
  "test",
  "--config=playwright.onboarding-videos.config.ts",
  "--workers=1",
], { cwd: root, env: process.env, stdio: "inherit" });

if (runner.status !== 0) {
  process.exit(runner.status ?? 1);
}

for (const key of videoKeys) {
  const scenarioDir = path.join(resultsDir, `onboarding-videos-gera-video-curto-para-${key}`);
  const source = path.join(scenarioDir, "video.webm");
  const target = path.join(outputDir, `${key}.webm`);
  if (!fs.existsSync(source) || fs.statSync(source).size === 0) {
    throw new Error(`Video ausente ou vazio para ${key}: ${source}`);
  }
  fs.copyFileSync(source, target);
}

console.log(`Videos de onboarding gerados em ${outputDir}`);
