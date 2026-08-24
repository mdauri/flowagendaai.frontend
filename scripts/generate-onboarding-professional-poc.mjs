import { cp, readdir, rm, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";

const frontendDir = resolve(new URL("..", import.meta.url).pathname);
const apiDir = "/home/dauri/Projects/worktrees/flowagendaai/onboarding-guiado-ativacao/api";
const databaseUrl = "postgresql://agendoro_user:Ag3nd0r0!Secure2026@127.0.0.1:5432/agendoro?schema=public";
const outputDir = join(frontendDir, "test-results/onboarding-professional-poc");
const destination = join(frontendDir, "public/onboarding-videos/first-professional-poc.webm");

function run(command, args, cwd, env = {}) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, { cwd, env: { ...process.env, ...env }, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolveRun() : reject(new Error(`${command} terminou com codigo ${code}`)));
  });
}

await rm(outputDir, { recursive: true, force: true });
await run("npx", ["tsx", "scripts/seed-onboarding-professional-demo.ts"], apiDir, { DATABASE_URL: databaseUrl });
await run("npx", ["playwright", "test", "--config=playwright.onboarding-professional-demo.config.ts", "e2e/onboarding-professional-demo.spec.ts"], frontendDir);

async function findWebm(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      const found = await findWebm(path);
      if (found) return found;
    } else if (entry.name.endsWith(".webm")) {
      return path;
    }
  }
  return null;
}

const source = await findWebm(outputDir);
if (!source) throw new Error("Nenhum video WebM foi gerado pelo POC.");
await cp(source, destination);
const metadata = await stat(destination);
console.log(JSON.stringify({ path: destination, bytes: metadata.size }, null, 2));
