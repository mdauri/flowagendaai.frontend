import { expect, test } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });
test.setTimeout(60_000);

test("executa a etapa de primeiro profissional contra API e banco reais", async ({ page }, testInfo) => {
  const projectKey = testInfo.project.name;
  const projectEmail = `e2e.onboarding.real.${projectKey}@agendoro.test`;
  await page.goto("/login");
  await page.getByLabel("Email").fill(process.env.E2E_ONBOARDING_EMAIL ?? projectEmail);
  await page.getByLabel("Senha").fill(process.env.E2E_ONBOARDING_PASSWORD ?? "E2E-Onboarding@2026");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/app/**");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  const checklist = page.getByTestId("activation-checklist");
  await expect(checklist).toBeVisible();
  await expect(checklist.getByText(/passos/i)).toBeVisible();

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
