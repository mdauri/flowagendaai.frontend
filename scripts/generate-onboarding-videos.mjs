import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";

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
const demoBootstrapTrimSeconds = 3.5;

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

function findVideo(directory, key) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.includes(`video-onboarding-${key}`) || entry.name.includes(`video-curto-para-${key}`)) {
        const candidate = path.join(entryPath, "video.webm");
        if (fs.existsSync(candidate)) return candidate;
      }
      const nested = findVideo(entryPath, key);
      if (nested) return nested;
    }
  }
  return null;
}

function trimDemoBootstrap(source, target) {
  const result = spawnSync("ffmpeg", [
    "-y",
    "-loglevel", "error",
    "-i", source,
    "-ss", String(demoBootstrapTrimSeconds),
    "-c:v", "libvpx",
    "-deadline", "realtime",
    "-cpu-used", "8",
    "-crf", "10",
    "-b:v", "0",
    "-an",
    target,
  ], { cwd: root, stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`Nao foi possivel remover o bootstrap visual do video ${source}`);
  }
}

const manifest = { version: "", videos: {} };
for (const key of videoKeys) {
  const source = findVideo(resultsDir, key);
  const target = path.join(outputDir, `${key}.webm`);
  if (!source || !fs.existsSync(source) || fs.statSync(source).size === 0) {
    throw new Error(`Video ausente ou vazio para ${key}: ${source}`);
  }
  const rawTarget = `${target}.raw.webm`;
  fs.copyFileSync(source, rawTarget);
  trimDemoBootstrap(rawTarget, target);
  fs.rmSync(rawTarget, { force: true });
  const hash = crypto.createHash("sha256").update(fs.readFileSync(target)).digest("hex").slice(0, 16);
  manifest.videos[key] = hash;
}

manifest.version = crypto.createHash("sha256").update(JSON.stringify(manifest.videos)).digest("hex").slice(0, 16);
fs.writeFileSync(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Videos de onboarding gerados em ${outputDir}`);
