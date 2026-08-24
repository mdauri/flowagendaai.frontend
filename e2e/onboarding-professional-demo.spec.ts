import { expect, test } from "@playwright/test";

test("POC didatico: cadastrar o primeiro profissional", async ({ page }) => {
  await page.goto("/login");
  await page.addStyleTag({ content: `
    .onboarding-demo-caption { position: fixed; z-index: 2147483646; left: 50%; bottom: 86px; transform: translateX(-50%); background: rgba(20, 16, 12, .92); color: #fff; border: 1px solid rgba(255, 171, 70, .75); border-radius: 10px; padding: 12px 20px; font: 600 20px/1.2 system-ui, sans-serif; letter-spacing: .01em; box-shadow: 0 8px 30px rgba(0,0,0,.35); }
    .onboarding-demo-cursor { position: fixed; z-index: 2147483647; width: 18px; height: 18px; border: 3px solid #fff; border-radius: 50%; background: #ff9f3f; box-shadow: 0 0 0 5px rgba(255,159,63,.3), 0 2px 8px rgba(0,0,0,.45); pointer-events: none; transform: translate(-50%, -50%); transition: left .35s ease, top .35s ease; }
    .onboarding-demo-highlight { outline: 4px solid #ff9f3f !important; outline-offset: 5px !important; transition: outline .2s ease; }
  `});
  await page.evaluate(() => {
    const caption = document.createElement("div");
    caption.className = "onboarding-demo-caption";
    caption.setAttribute("aria-live", "polite");
    document.body.append(caption);
    const cursor = document.createElement("div");
    cursor.className = "onboarding-demo-cursor";
    document.body.append(cursor);
    document.addEventListener("mousemove", (event) => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    });
  });
  const caption = (text: string) => page.locator(".onboarding-demo-caption").evaluate((node, value) => { node.textContent = value; }, text);
  const pause = (ms: number) => page.waitForTimeout(ms);
  const highlight = async (locator: ReturnType<typeof page.getByRole>) => {
    await locator.evaluate((node) => node.classList.add("onboarding-demo-highlight"));
    await pause(900);
  };

  await caption("Entre no Agendoro para começar");
  await pause(2000);
  await page.getByLabel("Email").fill("onboarding-professional-demo@example.test");
  await page.getByLabel("Senha").fill("Onboarding123!");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/app/**");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await caption("Acesse Profissionais pelo checklist");
  await pause(1800);

  const item = page.getByRole("listitem").filter({ hasText: "Primeiro profissional" });
  const cta = item.getByRole("button", { name: "Configurar agora" });
  await highlight(cta);
  await cta.click();
  await pause(1200);
  await page.waitForURL("**/app/professionals");
  await expect(page.getByRole("heading", { name: "Profissionais", exact: true })).toBeVisible();
  await caption("Preencha os dados do profissional");
  await pause(1800);

  const name = page.getByLabel("Nome completo");
  const description = page.getByLabel("Descricao (opcional)");
  await page.mouse.move(260, 330);
  await highlight(name);
  await name.fill("Maria Demo");
  await pause(900);
  await page.mouse.move(280, 520);
  await highlight(description);
  await description.fill("Atende com hora marcada.");
  await pause(1200);

  const save = page.getByRole("button", { name: "Criar profissional" });
  await caption("Salve o profissional");
  await highlight(save);
  await page.mouse.move(300, 650);
  await pause(700);
  await save.click();
  await expect(page.getByText("Profissional criado e adicionado na listagem atual.", { exact: true })).toBeVisible();
  await caption("Pronto. Seu primeiro profissional está cadastrado.");
  await pause(4800);
});
