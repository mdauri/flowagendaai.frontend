import { expect, test } from "@playwright/test";
import { mockOnboardingVideoApi } from "./helpers/onboarding-video-fixture";

test.describe("onboarding dispensável", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem("agendoro:token", "onboarding-e2e-token"));
  });

  test("ocultação incompleta persiste e reabre preservando o progresso", async ({ page }) => {
    await mockOnboardingVideoApi(page, { completedSteps: 6 });
    await page.goto("/app/dashboard");

    const checklist = page.getByTestId("activation-checklist");
    await expect(checklist).toBeVisible();
    await expect(checklist).toContainText("6/8");
    await page.getByRole("button", { name: "Ocultar configuração inicial" }).click();
    await expect(page.getByRole("dialog")).toContainText("Você poderá reabrir este checklist depois");
    await page.getByRole("button", { name: "Ocultar checklist" }).click();
    await expect(checklist).not.toBeVisible();

    await page.reload();
    await expect(page.getByTestId("activation-checklist")).not.toBeVisible();

    await page.goto("/app/settings");
    await expect(page.getByTestId("onboarding-visibility-settings")).toContainText("Checklist oculto");
    await page.getByRole("button", { name: "Mostrar checklist de configuração" }).click();
    await expect(page.getByText("Checklist de configuração reaberto.")).toBeVisible();

    await page.goto("/app/dashboard");
    await expect(page.getByTestId("activation-checklist")).toContainText("6/8");
  });

  test("ocultação do estado concluído preserva 8/8", async ({ page }) => {
    await mockOnboardingVideoApi(page, { complete: true });
    await page.goto("/app/dashboard");

    const compact = page.getByTestId("activation-compact");
    await expect(compact).toBeVisible();
    await expect(compact).toContainText("Ativacao concluida");
    await compact.getByRole("button", { name: "Ocultar configuração inicial" }).click();
    await expect(compact).not.toBeVisible();

    await page.reload();
    await expect(page.getByTestId("activation-compact")).not.toBeVisible();
    await page.goto("/app/settings");
    await page.getByRole("button", { name: "Mostrar checklist de configuração" }).click();
    await page.goto("/app/dashboard");
    await expect(page.getByTestId("activation-compact")).toContainText("Ativacao concluida");
  });

  test("fluxo de ocultação funciona em viewport mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await mockOnboardingVideoApi(page);
    await page.goto("/app/dashboard");

    const hide = page.getByRole("button", { name: "Ocultar configuração inicial" });
    await expect(hide).toBeVisible();
    await hide.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continuar mostrando" })).toBeFocused();
    await page.getByRole("button", { name: "Ocultar checklist" }).click();
    await expect(page.getByTestId("activation-checklist")).not.toBeVisible();
    expect(await page.locator("body").evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});
