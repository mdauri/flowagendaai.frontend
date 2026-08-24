import { expect, test } from "@playwright/test";

test("executa a etapa de primeiro profissional contra API e banco reais", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("onboarding-browser@example.test");
  await page.getByLabel("Senha").fill("Onboarding123!");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/app/**");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  const checklist = page.getByTestId("activation-checklist");
  await expect(checklist).toBeVisible();
  await expect(checklist.getByText("8 passos", { exact: false })).toBeVisible();

  const professionalItem = page.getByRole("listitem").filter({ hasText: "Primeiro profissional" });
  await professionalItem.getByRole("button", { name: "Ver como fazer" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Configurar agora" }).click();

  await expect(page.getByRole("heading", { name: "Profissionais", exact: true })).toBeVisible();
  const professionalForm = page.getByRole("heading", { name: "Novo profissional" }).locator("..");
  await expect(professionalForm).toBeVisible();
  await page.getByLabel("Nome completo").fill("Maria Onboarding");
  await page.getByLabel("Descricao (opcional)").fill("Atende com hora marcada.");
  await page.getByRole("button", { name: "Criar profissional" }).click();
  await expect(page.getByText("Profissional criado e adicionado na listagem atual.", { exact: true })).toBeVisible();

  await page.goto("/app/dashboard");
  await expect(page.getByTestId("activation-checklist")).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Primeiro profissional" })).toContainText("Concluida");
});
