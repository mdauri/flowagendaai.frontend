import { expect, test } from "@playwright/test";
import { demoClick, demoPause, demoType, highlight, installDemoHarness, moveCursorTo, showCaption, showChecklistContext } from "./helpers/onboarding-demo";

test.use({ storageState: { cookies: [], origins: [] } });
test.setTimeout(120_000);

test("POC didatico: cadastrar o primeiro profissional", async ({ page }, testInfo) => {
  const projectEmail = `e2e.onboarding.demo.${testInfo.project.name}@agendoro.test`;
  await page.goto("/login");
  await installDemoHarness(page);
  await showCaption(page, "Entre no Agendoro para começar");
  await demoPause(page, 2000);
  await demoType(page, page.getByLabel("Email"), process.env.E2E_ONBOARDING_VIDEO_EMAIL ?? projectEmail, 45);
  await demoType(page, page.getByLabel("Senha"), process.env.E2E_ONBOARDING_PASSWORD ?? "E2E-Onboarding@2026", 55);
  await demoClick(page, page.getByRole("button", { name: "Entrar" }));
  await page.waitForURL("**/app/**");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  const item = await showChecklistContext(page, "Primeiro profissional");
  const configure = item.getByRole("button", { name: "Configurar agora" });
  await showCaption(page, "Clique em Configurar agora");
  await highlight(page, configure);
  await demoClick(page, configure);
  await page.waitForURL("**/app/professionals");
  await expect(page.getByRole("heading", { name: "Profissionais", exact: true })).toBeVisible();
  await showCaption(page, "Informe o nome do profissional");
  await demoPause(page, 1400);

  const name = page.getByLabel("Nome completo");
  await highlight(page, name);
  await demoType(page, name, "Maria Demo");
  await showCaption(page, "Adicione uma descrição, se quiser");
  const description = page.getByLabel("Descricao (opcional)");
  await highlight(page, description);
  await demoType(page, description, "Atende com hora marcada.");
  await demoPause(page, 900);

  const save = page.getByRole("button", { name: "Criar profissional" });
  await showCaption(page, "Salve o profissional");
  await highlight(page, save);
  await demoClick(page, save);
  await expect(page.getByText("Profissional criado e adicionado na listagem atual.", { exact: true })).toBeVisible();
  const result = page.getByRole("heading", { name: "Maria Demo", exact: true }).first();
  await expect(result).toBeVisible();
  await moveCursorTo(page, result);
  await highlight(page, result, 900);
  await showCaption(page, "Pronto. Seu primeiro profissional está cadastrado.");
  await demoPause(page, 2800);
});
