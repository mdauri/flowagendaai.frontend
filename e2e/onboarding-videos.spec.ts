import { expect, test } from "@playwright/test";
import { demoClick, demoPause, demoType, highlight, installDemoHarness, showCaption, showChecklistContext } from "./helpers/onboarding-demo";
import { mockOnboardingVideoApi, videoSteps } from "./helpers/onboarding-video-fixture";

test.use({ video: { mode: "on", size: { width: 1280, height: 720 } } });
test.setTimeout(120_000);

for (const [videoKey, label] of videoSteps) {
  test(`gera video onboarding ${videoKey}`, async ({ page }) => {
    await mockOnboardingVideoApi(page);
    await page.goto("/app/dashboard");
    await installDemoHarness(page);
    const item = await showChecklistContext(page, label);
    const configure = item.getByRole("button", { name: videoKey === "publish" ? "Publicar link" : "Configurar agora" });
    await showCaption(page, "Clique em Configurar agora");
    await highlight(page, configure);
    if (videoKey !== "publish") await demoClick(page, configure);

    if (videoKey === "company-data" || videoKey === "appearance") {
      await page.waitForURL("**/app/settings**");
      await expect(page.getByRole("heading", { name: "Configuracoes" })).toBeVisible();
      await showCaption(page, videoKey === "company-data" ? "Informe o nome do estabelecimento" : "Personalize o perfil publico");
      await demoType(page, page.getByLabel("Nome do estabelecimento"), videoKey === "company-data" ? "Studio Video" : "Studio Video Personalizado");
      await showCaption(page, "Informe o endereço da empresa");
      await demoType(page, page.locator("#geolocation-address-input"), "Rua dos Tutoriais, 100");
      const save = page.getByRole("button", { name: "Salvar perfil" });
      await showCaption(page, "Salve as informações");
      await highlight(page, save);
      await demoClick(page, save);
      await expect(page.getByRole("status")).toContainText("Configuracoes salvas com sucesso");
    } else if (videoKey === "business-hours") {
      await page.waitForURL("**/app/settings**");
      await expect(page.getByText("Horário de Funcionamento", { exact: true })).toBeVisible();
      await showCaption(page, "Defina o horário de funcionamento");
      const time = page.locator('input[type="time"]').first();
      await highlight(page, time);
      await demoType(page, time, "09:00", 70);
      const save = page.getByRole("button", { name: "Salvar horarios" });
      await showCaption(page, "Salve os horários");
      await highlight(page, save);
      await demoClick(page, save);
      await expect(page.getByRole("status")).toContainText("Atualizado com sucesso");
    } else if (videoKey === "notifications") {
      await page.waitForURL("**/app/settings**");
      await expect(page.getByText("Lembretes de compromisso", { exact: true })).toBeVisible();
      const enabled = page.locator('input[aria-label="Ativar lembretes de compromisso"]');
      await showCaption(page, "Ative os lembretes de compromisso");
      await highlight(page, enabled);
      if (!(await enabled.isChecked())) await demoClick(page, enabled);
      const save = page.getByRole("button", { name: "Salvar lembretes" });
      await showCaption(page, "Salve as notificações");
      await highlight(page, save);
      await demoClick(page, save);
      await expect(page.getByRole("status")).toContainText("Lembretes salvos com sucesso");
    } else if (videoKey === "first-professional") {
      await page.waitForURL("**/app/professionals");
      await expect(page.getByRole("heading", { name: "Profissionais", exact: true })).toBeVisible();
      await showCaption(page, "Informe o nome do profissional");
      await demoType(page, page.getByLabel("Nome completo"), "Maria Demo");
      await showCaption(page, "Adicione uma descrição, se quiser");
      await demoType(page, page.getByLabel("Descricao (opcional)"), "Atende com hora marcada.");
      const save = page.getByRole("button", { name: "Criar profissional" });
      await showCaption(page, "Salve o profissional");
      await highlight(page, save);
      await demoClick(page, save);
      await expect(page.getByText("Profissional criado e adicionado na listagem atual.", { exact: true })).toBeVisible();
      await expect(page.getByText("Maria Demo", { exact: true })).toBeVisible();
    } else if (videoKey === "first-service") {
      await page.waitForURL("**/app/services");
      await expect(page.getByRole("heading", { name: "Servicos", exact: true })).toBeVisible();
      await showCaption(page, "Informe o nome do serviço");
      await demoType(page, page.getByLabel("Nome do servico"), "Consulta de demonstracao");
      await showCaption(page, "Defina a duração do serviço");
      await demoType(page, page.getByLabel("Duracao em minutos"), "60", 70);
      await showCaption(page, "Informe o preço, se desejar");
      await demoType(page, page.getByLabel("Preço em reais (R$)"), "12000", 60);
      const save = page.getByRole("button", { name: "Criar servico" });
      await showCaption(page, "Salve o serviço");
      await highlight(page, save);
      await demoClick(page, save);
      await expect(page.getByText("Servico criado e adicionado na listagem atual.", { exact: true })).toBeVisible();
    } else if (videoKey === "test-booking") {
      await page.clock.install({ time: new Date("2026-08-30T15:00:00-03:00") });
      await page.waitForURL("**/p/maria-teste**");
      await installDemoHarness(page);
      await expect(page.getByRole("heading", { name: "Escolha o serviço", exact: true })).toBeVisible();
      await showCaption(page, "Escolha o serviço para testar a agenda");
      await demoClick(page, page.getByRole("button", { name: /^Selecionar / }).first());
      await showCaption(page, "Escolha uma data para simular um agendamento");
      const availableDay = page.locator('button:not([disabled])').filter({ hasText: /^31$/ });
      await expect(availableDay).toBeVisible();
      await demoClick(page, availableDay);
      await showCaption(page, "Escolha um horário disponível");
      await demoClick(page, page.getByRole("button", { name: "Ver horários" }));
      await expect(page.getByText("Horários disponíveis", { exact: true })).toBeVisible();
      await demoClick(page, page.getByRole("button", { name: /10:00/ }));
      await showCaption(page, "Informe os dados para testar a agenda");
      await demoClick(page, page.getByRole("button", { name: "Continuar" }));
      await demoType(page, page.getByPlaceholder("Seu nome"), "Cliente de Teste");
      await demoType(page, page.getByPlaceholder("+55 (11) 9xxxx-xxxx"), "+55 (11) 99999-9999", 45);
      await demoClick(page, page.getByRole("button", { name: "Continuar" }));
      await expect(page.getByText("Agendamento confirmado!", { exact: true })).toBeVisible();
      await showCaption(page, "Teste concluído: a agenda está funcionando");
    } else if (videoKey === "publish") {
      await expect(page.getByTestId("activation-checklist")).toBeVisible();
      await showCaption(page, "Publique sua agenda para disponibilizar o link");
      const [popup] = await Promise.all([
        page.waitForEvent("popup"),
        demoClick(page, item.getByRole("button", { name: "Publicar link" })),
      ]);
      await expect(popup).toHaveURL(/\/c\/tenant-video\/catalog/);
      await popup.close();
      await showCaption(page, "Pronto. Copie e compartilhe este link com seus clientes");
      await demoPause(page, 2800);
    }
    await demoPause(page, 2800);
  });
}
