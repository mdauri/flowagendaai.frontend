import { spawn, spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import path from "node:path";
import process from "node:process";

const frontendDir = process.cwd();
const apiDir = path.resolve(process.env.E2E_API_DIR ?? path.join(frontendDir, "../api"));
const runId = `${process.pid}-${Date.now()}`;
const postgresName = `agendoro-e2e-postgres-${runId}`;
const redisName = `agendoro-e2e-redis-${runId}`;
const postgresPort = process.env.E2E_POSTGRES_PORT ?? "15441";
const redisPort = process.env.E2E_REDIS_PORT ?? "16381";
const apiPort = process.env.E2E_API_PORT ?? "3333";
const databaseUrl = `postgresql://e2e_user:e2e_password@127.0.0.1:${postgresPort}/agendoro_e2e?schema=public`;
const redisUrl = `redis://127.0.0.1:${redisPort}`;
const apiEnv = {
  ...process.env,
  NODE_ENV: "test",
  PORT: apiPort,
  DATABASE_URL: databaseUrl,
  REDIS_URL: redisUrl,
  FRONTEND_APP_URL: `http://localhost:${process.env.E2E_FRONTEND_PORT ?? "5173"}`,
  API_PUBLIC_URL: `http://localhost:${apiPort}`,
  JWT_SECRET: "e2e-only-jwt-secret",
  SEED_SYSTEM_ADMIN_NAME: "CI E2E System Admin",
  SEED_SYSTEM_ADMIN_EMAIL: "e2e.system-admin@agendoro.test",
  SEED_SYSTEM_ADMIN_PASSWORD: process.env.CI_SEED_SYSTEM_ADMIN_PASSWORD,
  SEED_SYSTEM_ADMIN_ROLE: "system-admin",
  BILLING_ENABLED: "false",
  BOOKING_PENDING_TTL_SWEEP_ENABLED: "false",
  LOG_LEVEL: "silent",
};

let apiProcess;
let playwrightProcess;
let cleanupStarted = false;
let requestedExitCode;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", ...options });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with status ${result.status}`);
  }
}

function docker(args) {
  run("docker", args);
}

async function waitFor(check, label, attempts = 45) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (check()) return;
    await delay(1000);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

function killProcessGroup(child, signal) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  try {
    process.kill(-child.pid, signal);
  } catch (error) {
    if (error?.code !== "ESRCH") throw error;
  }
}

function waitForExit(child, timeoutMs) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeoutMs);
    child.once("close", () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

async function stopProcess(child, label) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  console.log(`[E2E] Stopping ${label}...`);
  killProcessGroup(child, "SIGTERM");
  await waitForExit(child, 1500);
  if (child.exitCode === null && child.signalCode === null) {
    killProcessGroup(child, "SIGKILL");
    await waitForExit(child, 1000);
  }
  console.log(`[E2E] ${label} stopped`);
}

async function cleanup() {
  if (cleanupStarted) return;
  cleanupStarted = true;
  await stopProcess(playwrightProcess, "Playwright");
  await stopProcess(apiProcess, "API");
  console.log("[E2E] Stopping Redis/Postgres...");
  for (const name of [postgresName, redisName]) {
    spawnSync("docker", ["rm", "-f", name], { stdio: "ignore" });
  }
  const authFile = process.env.E2E_AUTH_FILE ?? `/tmp/agendoro-e2e-auth-${runId}.json`;
  rmSync(authFile, { force: true });
  console.log("[E2E] Cleanup complete");
}

function cleanupSync() {
  killProcessGroup(playwrightProcess, "SIGTERM");
  killProcessGroup(apiProcess, "SIGTERM");
  for (const name of [postgresName, redisName]) {
    spawnSync("docker", ["rm", "-f", name], { stdio: "ignore" });
  }
}

function runPlaywright(args, options) {
  return new Promise((resolve) => {
    playwrightProcess = spawn("npx", args, { ...options, detached: true });
    playwrightProcess.once("close", (code, signal) => resolve({ code, signal }));
  });
}

async function main() {
  if (!existsSync(path.join(apiDir, "package.json"))) {
    throw new Error(`E2E_API_DIR does not contain the API checkout: ${apiDir}`);
  }

  process.on("SIGINT", () => { requestedExitCode = 130; killProcessGroup(playwrightProcess, "SIGTERM"); });
  process.on("SIGTERM", () => { requestedExitCode = 143; killProcessGroup(playwrightProcess, "SIGTERM"); });
  process.on("exit", cleanupSync);

  try {
    docker(["run", "-d", "--name", postgresName, "--network", "host", "-e", "POSTGRES_USER=e2e_user", "-e", "POSTGRES_PASSWORD=e2e_password", "-e", "POSTGRES_DB=agendoro_e2e", "postgres:17", "postgres", "-p", postgresPort]);
    docker(["run", "-d", "--name", redisName, "--network", "host", "redis:7.4-alpine", "redis-server", "--port", redisPort]);

    await waitFor(() => spawnSync("docker", ["exec", postgresName, "pg_isready", "-U", "e2e_user", "-d", "postgres", "-p", postgresPort], { stdio: "ignore" }).status === 0, "PostgreSQL");
    await waitFor(() => spawnSync("docker", ["exec", redisName, "redis-cli", "-p", redisPort, "ping"], { stdio: "ignore" }).status === 0, "Redis");

    run("npx", ["prisma", "migrate", "deploy"], { cwd: apiDir, env: apiEnv });
    run("npm", ["run", "prisma:seed"], { cwd: apiDir, env: apiEnv });
    run("npm", ["run", "prisma:seed:e2e"], { cwd: apiDir, env: apiEnv });

    apiProcess = spawn("npx", ["tsx", "server.ts"], { cwd: apiDir, env: apiEnv, stdio: "inherit", detached: true });
    await waitFor(() => spawnSync("curl", ["-fsS", `http://localhost:${apiPort}/health/live`], { stdio: "ignore" }).status === 0, "Agendoro API");

    const result = await runPlaywright(["playwright", "test", ...process.argv.slice(2)], {
      cwd: frontendDir,
      env: {
        ...process.env,
        E2E_API_DIR: apiDir,
        VITE_API_BASE_URL: `http://localhost:${apiPort}`,
        E2E_EMAIL: process.env.E2E_EMAIL ?? "e2e.system-admin@agendoro.test",
        E2E_PASSWORD: process.env.E2E_PASSWORD ?? "E2E@2026",
        PLAYWRIGHT_OUTPUT_DIR: process.env.PLAYWRIGHT_OUTPUT_DIR ?? `/tmp/agendoro-e2e-results-${runId}`,
        PLAYWRIGHT_REPORT_DIR: process.env.PLAYWRIGHT_REPORT_DIR ?? `/tmp/agendoro-e2e-report-${runId}`,
        VITE_CACHE_DIR: process.env.VITE_CACHE_DIR ?? `/tmp/agendoro-vite-cache-${runId}`,
        E2E_AUTH_FILE: process.env.E2E_AUTH_FILE ?? `/tmp/agendoro-e2e-auth-${runId}.json`,
        PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS: process.env.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS ?? "1",
      },
      stdio: "inherit",
    });
    const exitCode = requestedExitCode ?? result.code ?? 1;
    console.log(`[E2E] Playwright finished: exit=${exitCode}`);
    process.exitCode = exitCode;
  } finally {
    await cleanup();
    console.log(`[E2E] exiting with code ${process.exitCode ?? requestedExitCode ?? 1}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
