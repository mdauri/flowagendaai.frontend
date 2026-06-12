import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { width: 320, height: 568, label: "320x568" },
  { width: 360, height: 740, label: "360x740" },
  { width: 390, height: 844, label: "390x844" },
  { width: 414, height: 896, label: "414x896" },
] as const;

const ROUTES = [
  { path: "/app/slots", heading: "Consulta de horarios" },
  { path: "/app/settings", heading: "Configuracoes" },
  { path: "/app/api-tokens", heading: "API Tokens M2M" },
  { path: "/app/system-admin/tenants/whatsapp", heading: "WhatsApp por tenant" },
  { path: "/app/system-admin/meta-whatsapp", heading: "Dashboard Meta API" },
] as const;

test.describe("Mobile overflow regression", () => {
  test.describe.configure({ mode: "serial", timeout: 120_000 });

  for (const viewport of VIEWPORTS) {
    test(`keeps dashboard-adjacent routes within viewport at ${viewport.label}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const route of ROUTES) {
        await page.goto(route.path, { waitUntil: "commit" });
        await expect(page.getByRole("heading", { name: route.heading })).toBeVisible({
          timeout: 20_000,
        });

        await page.waitForTimeout(500);

        const metrics = await page.evaluate(() => ({
          viewportWidth: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
        }));

        expect(
          metrics.scrollWidth,
          `Route ${route.path} overflowed at ${viewport.label}`
        ).toBeLessThanOrEqual(metrics.viewportWidth);
      }
    });
  }
});
