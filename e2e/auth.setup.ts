import { test as setup, expect } from "@playwright/test";
import path from "node:path";

const authFile = path.join(process.cwd(), "playwright", ".auth", "user.json");

setup("authenticate", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    throw new Error("Missing E2E_EMAIL or E2E_PASSWORD env vars.");
  }

  await page.goto("/login");

  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();

  await page.waitForURL("**/app/**");
  await expect(page.getByRole("heading", { name: "Dashboard operacional" })).toBeVisible();

  await page.context().storageState({ path: authFile });
});

