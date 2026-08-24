import { expect, test } from "@playwright/test";
import { mockOnboardingVideoApi } from "./helpers/onboarding-video-fixture";

test.use({ viewport: { width: 390, height: 844 } });

test("modal de video do onboarding funciona em viewport mobile", async ({ page }) => {
  await mockOnboardingVideoApi(page);
  await page.goto("/app/dashboard");

  const trigger = page
    .getByRole("listitem")
    .filter({ hasText: "Primeiro profissional" })
    .getByRole("button", { name: "Ver como fazer" });
  await expect(trigger).toBeVisible();
  await trigger.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const dialogBox = await dialog.boundingBox();
  expect(dialogBox).not.toBeNull();
  expect(dialogBox!.width).toBeLessThanOrEqual(390);
  expect(await page.locator("body").evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await expect(dialog.getByRole("button", { name: "Fechar video" })).toBeFocused();
  await expect(dialog.locator("video")).toHaveAttribute("src", /first-professional\.webm\?v=/);

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
