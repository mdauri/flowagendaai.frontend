import { expect, test } from "@playwright/test";

const catalogResponse = {
  tenant: {
    id: "tenant-1",
    name: "Studio Teste",
    slug: "test-studio",
    logoUrl: null,
    coverImageUrl: null,
    publicAddress: "Rua das Flores, 123",
  },
  services: [
    {
      id: "service-1",
      name: "Corte",
      description: "Corte com finalizacao.",
      durationInMinutes: 60,
      price: 90,
      imageUrl: null,
      thumbnailUrl: null,
    },
    {
      id: "service-2",
      name: "Coloracao",
      description: "Coloracao completa.",
      durationInMinutes: 90,
      price: 180,
      imageUrl: null,
      thumbnailUrl: null,
    },
    {
      id: "service-3",
      name: "Tratamento",
      description: "Tratamento hidratante.",
      durationInMinutes: 45,
      price: 70,
      imageUrl: null,
      thumbnailUrl: null,
    },
  ],
};

test.describe("Public mobile smoke", () => {
  test("validates catalog discovery and public booking flow on mobile viewport", async ({
    page,
  }) => {
    await page.route("**/public/catalog/test-studio", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(catalogResponse),
      });
    });

    await page.route("**/public/services/**", async (route) => {
      if (!route.request().url().includes("/public/services/service-1/professionals")) {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          serviceId: "service-1",
          serviceName: "Corte",
          professionals: [
            {
              id: "professional-1",
              name: "Maria Silva",
              slug: "maria-silva",
            },
          ],
        }),
      });
    });

    await page.route("**/public/professionals/maria-silva", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "professional-1",
          name: "Maria Silva",
          slug: "maria-silva",
          tenantId: "tenant-1",
          tenantName: "Studio Teste",
          tenantSlug: "test-studio",
          tenantTimezone: "America/Sao_Paulo",
          tenantLogoUrl: null,
          tenantCoverImageUrl: null,
          tenantCoverThumbnailUrl: null,
          tenantPublicAddress: "Rua das Flores, 123",
        }),
      });
    });

    await page.route("**/public/professionals/maria-silva/services", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          services: catalogResponse.services.map((service) => ({
            id: service.id,
            name: service.name,
            durationInMinutes: service.durationInMinutes,
          })),
        }),
      });
    });

    await page.route("**/public/professionals/maria-silva/available-dates**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          tenantTimezone: "America/Sao_Paulo",
          availableDates: ["2026-08-31"],
        }),
      });
    });

    await page.route("**/public/professionals/maria-silva/slots**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          tenantTimezone: "America/Sao_Paulo",
          slots: [
            {
              start: "2026-09-01T13:00:00.000Z",
              end: "2026-09-01T14:00:00.000Z",
            },
          ],
        }),
      });
    });

    await page.goto("/c/test-studio/catalog", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("img", { name: /Banner for Studio Teste/i }),
    ).toBeVisible();
    await expect(page.getByRole("region", { name: "Serviços disponíveis" })).toBeVisible();

    const metrics = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.viewportWidth);

    await Promise.all([
      page.waitForURL(/\/p\/maria-silva\?service=service-1/),
      page.getByRole("button", { name: /Agendar Corte/i }).click(),
    ]);
    await expect(page.getByText("Escolha a data")).toBeVisible();

    const monthLabel = page.locator("span", { hasText: /\w+ 2026/i }).first();
    const initialMonthText = (await monthLabel.textContent())?.trim() ?? "";

    const firstAvailableDay = page.locator('button:not([disabled])').filter({ hasText: /^31$/ });
    await expect(firstAvailableDay).toBeVisible();
    await firstAvailableDay.click();

    await expect(page.getByRole("button", { name: /Ver horários/i })).toBeEnabled();

    const monthTextAfterSelect = (await monthLabel.textContent())?.trim() ?? "";
    if (monthTextAfterSelect !== initialMonthText) {
      await expect(monthLabel).not.toHaveText(initialMonthText);
    }
    await page.getByRole("button", { name: /Ver horários/i }).click();
    await expect(page.getByRole("button", { name: /10:00 – 11:00/i })).toBeVisible();
  });
});
