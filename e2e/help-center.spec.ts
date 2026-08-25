import { expect, test } from "@playwright/test";

test.describe("Central de Ajuda pública", () => {
  test("permite buscar, ler vídeo, navegar por relacionados e voltar à Central", async ({ page }, testInfo) => {
    await page.goto("/ajuda", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Como podemos ajudar?" })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("help-home.png"), fullPage: true });

    await page.getByLabel("Buscar na Central de Ajuda").fill("bloquear horário");
    await expect(page.getByText("Bloquear horários e dias")).toBeVisible();
    await page.getByRole("link", { name: "Bloquear horários e dias" }).click();

    await expect(page).toHaveURL(/\/ajuda\/agenda\/bloquear-horario$/);
    await expect(page.getByRole("heading", { name: "Bloquear horários e dias" })).toBeVisible();

    await page.getByRole("link", { name: "Configurar horários do profissional" }).click();
    await expect(page).toHaveURL(/\/ajuda\/profissionais\/disponibilidade-profissional$/);

    await page.goto("/ajuda/primeiros-passos/configurar-empresa", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Configurando sua empresa" })).toBeVisible();
    await expect(page.locator("video")).toHaveAttribute("src", /company-data\.webm$/);
    await expect(page.getByText(/passos escritos continuam disponíveis/i)).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("help-article-video.png"), fullPage: true });

    await page.getByRole("link", { name: "Voltar para a Central" }).click();
    await expect(page).toHaveURL(/\/ajuda$/);
  });

  test("mostra estado vazio útil e 404 coerente", async ({ page }, testInfo) => {
    await page.goto("/ajuda", { waitUntil: "networkidle" });
    await page.getByLabel("Buscar na Central de Ajuda").fill("termo que não existe");
    await expect(page.getByText("Não encontramos nenhum artigo para essa busca.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver categorias" })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("help-empty.png"), fullPage: true });

    await page.goto("/ajuda/nao-existe", { waitUntil: "networkidle" });
    await expect(page.getByText("Não encontramos esta página.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Voltar para a Central" })).toBeVisible();
  });
});

test("usuário autenticado acessa a Central e ajuda contextual", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "fluxo autenticado validado no projeto Chromium");

  await page.goto("/app/dashboard", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Ajuda", exact: true }).click();
  await expect(page).toHaveURL(/\/ajuda$/);
  await expect(page.getByRole("heading", { name: "Como podemos ajudar?" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("help-authenticated.png"), fullPage: true });

  await page.goto("/app/professionals", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Como configurar profissionais" }).click();
  await expect(page).toHaveURL(/\/ajuda\/profissionais\/primeiro-profissional$/);
});
