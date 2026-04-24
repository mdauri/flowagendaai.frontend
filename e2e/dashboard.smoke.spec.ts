import { test, expect } from "@playwright/test";

test.describe("Dashboard smoke", () => {
  test.beforeEach(async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on("pageerror", (error) => {
      consoleErrors.push(String(error));
    });

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    test.info().annotations.push({ type: "consoleErrorsRef", description: "Collected console errors in-memory." });

    await page.goto("/app/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard operacional" })).toBeVisible();

    await test.step("assert no console errors on load", async () => {
      expect(consoleErrors, consoleErrors.join("\n")).toEqual([]);
    });
  });

  test("loads dashboard and navigates dates", async ({ page }) => {
    await expect(page.getByText(/timezone America\/Sao_Paulo\./)).toBeVisible();

    const dateInput = page.getByLabel("Selecionar data do dashboard");
    const initialDate = await dateInput.inputValue();

    await page.getByRole("button", { name: "Ir para proximo dia" }).click();
    await expect(dateInput).not.toHaveValue(initialDate);
    const nextDate = await dateInput.inputValue();

    await page.getByRole("button", { name: "Ir para dia anterior" }).click();
    await expect(dateInput).toHaveValue(initialDate);

    await page.getByRole("button", { name: "Hoje" }).click();
    await expect(dateInput).toHaveValue(initialDate);

    await page.getByRole("button", { name: "Amanha" }).click();
    await expect(dateInput).toHaveValue(nextDate);

    await test.info().attach("dashboard.png", {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  });
});
