import { test as setup, expect } from "@playwright/test";
import path from "node:path";

const authFile = process.env.E2E_AUTH_FILE ?? path.join(process.cwd(), "playwright", ".auth", "user.json");
const defaultEmail = "e2e.system-admin@agendoro.test";
const defaultPassword = "E2E@2026";

setup("authenticate", async ({ page }) => {
  const email = process.env.E2E_EMAIL ?? defaultEmail;
  const password = process.env.E2E_PASSWORD ?? defaultPassword;

  await page.goto("/login");

  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();

  await page.waitForURL("**/app/**");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.context().storageState({ path: authFile });
});
