import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { width: 320, height: 568, label: "320x568" },
  { width: 360, height: 740, label: "360x740" },
  { width: 390, height: 844, label: "390x844" },
  { width: 414, height: 896, label: "414x896" },
] as const;

test.describe("Landing mobile responsiveness", () => {
  for (const viewport of VIEWPORTS) {
    test(`fits the landing within ${viewport.label}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/", { waitUntil: "networkidle" });

      await expect(page.getByRole("heading", { name: /Reduza faltas e ganhe tempo/ })).toBeVisible();
      await expect(page.getByRole("link", { name: "Começar teste grátis de 14 dias" }).first()).toBeVisible();

      const metrics = await page.evaluate(() => ({
        viewportWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
      }));

      expect(metrics.scrollWidth, `document overflowed at ${viewport.label}`).toBeLessThanOrEqual(metrics.viewportWidth);
      expect(metrics.bodyScrollWidth, `body overflowed at ${viewport.label}`).toBeLessThanOrEqual(metrics.viewportWidth);

      await testInfo.attach(`landing-${viewport.label}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });
    });
  }
});
