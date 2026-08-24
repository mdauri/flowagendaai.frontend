import type { Locator, Page } from "@playwright/test";

const harnessStyle = `
  .onboarding-demo-caption { position: fixed; z-index: 2147483646; left: 50%; bottom: 86px; transform: translateX(-50%); max-width: min(760px, calc(100vw - 48px)); background: rgba(20, 16, 12, .94); color: #fff; border: 1px solid rgba(255, 171, 70, .75); border-radius: 10px; padding: 12px 20px; text-align: center; font: 600 20px/1.2 system-ui, sans-serif; box-shadow: 0 8px 30px rgba(0,0,0,.35); }
  .onboarding-demo-cursor { position: fixed; z-index: 2147483647; width: 18px; height: 18px; border: 3px solid #fff; border-radius: 50%; background: #ff9f3f; box-shadow: 0 0 0 5px rgba(255,159,63,.3), 0 2px 8px rgba(0,0,0,.45); pointer-events: none; transform: translate(-50%, -50%); transition: left .35s ease, top .35s ease; }
  .onboarding-demo-highlight { outline: 4px solid #ff9f3f !important; outline-offset: 5px !important; transition: outline .2s ease; }
`;

export async function installDemoHarness(page: Page) {
  await page.addStyleTag({ content: harnessStyle });
  await page.evaluate(() => {
    document.querySelector(".onboarding-demo-caption")?.remove();
    document.querySelector(".onboarding-demo-cursor")?.remove();
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
}

export const demoPause = (page: Page, milliseconds: number) => page.waitForTimeout(milliseconds);

export async function showCaption(page: Page, text: string) {
  const caption = page.locator(".onboarding-demo-caption");
  if (!(await caption.count())) await installDemoHarness(page);
  await page.locator(".onboarding-demo-caption").evaluate((node, value) => { node.textContent = value; }, text);
}

export async function moveCursorTo(page: Page, target: Locator) {
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  if (!box) throw new Error("Alvo sem area visivel para o cursor de demonstracao.");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 });
  await demoPause(page, 350);
}

export async function highlight(page: Page, target: Locator, milliseconds = 1000) {
  await target.evaluate((node) => node.classList.add("onboarding-demo-highlight"));
  await demoPause(page, milliseconds);
}

export async function demoClick(page: Page, target: Locator) {
  await moveCursorTo(page, target);
  await target.click();
  await demoPause(page, 450);
}

export async function demoType(page: Page, target: Locator, value: string, delay = 55) {
  await moveCursorTo(page, target);
  await target.fill("");
  await target.pressSequentially(value, { delay });
}

export async function showChecklistContext(page: Page, label: string) {
  await page.goto("/app/dashboard");
  await page.getByTestId("activation-checklist").waitFor({ state: "visible" });
  const item = page.getByRole("listitem").filter({ hasText: label });
  await showCaption(page, `Cadastre: ${label}`);
  await highlight(page, item, 1500);
  return item;
}
