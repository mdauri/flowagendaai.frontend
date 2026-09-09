import { queryEvidence } from "./helpers/barbershop-db";
import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

const api = process.env.E2E_API_BASE_URL ?? "http://localhost:3336";
const catalog = "/c/barbearia-dom-pedro/catalog";
const profile = "/p/barbearia-dom-pedro-joao";
const firstTouchKey = "agendoro:acquisition:first-touch";
const campaign = "barbearias-jacarei-v1";
const tracking = (id: string) => `?utm_source=outbound&utm_medium=whatsapp&utm_campaign=${campaign}&prospect_id=${id}`;

test("public barbershop: catalog, professional, booking confirmation and conflict", async ({ page, request }, testInfo) => {
  const prospectId = randomUUID();
  await page.goto(catalog + tracking(prospectId));
  await expect(page.getByText("Barbearia Dom Pedro", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Seu cliente escolhe serviço, profissional, dia e horário sozinho.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Agendar Corte", exact: true })).toBeVisible();
  await expect.poll(() => page.locator("img").evaluateAll((imgs) => imgs.every((img) => img.complete && img.naturalWidth > 0))).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("catalog.png"), fullPage: true });
  expect(await page.locator("img").evaluateAll((imgs) => imgs.every((img) => img.complete && img.naturalWidth > 0))).toBe(true);
  await page.getByRole("button", { name: "Agendar Corte", exact: true }).click();
  for (const name of ["João", "Lucas", "Rafael"]) await expect(page.getByRole("button").filter({ hasText: name })).toBeVisible();
  await page.getByRole("button").filter({ hasText: "João" }).click();
  await page.waitForURL(/\/p\/barbearia-dom-pedro-joao/);
  await expect(page.getByText("Escolha a data")).toBeVisible();
  await page.locator("button:not([disabled])").filter({ hasText: /^\d{1,2}$/ }).first().click();
  await page.getByRole("button", { name: "Ver horários" }).click();
  await page.getByRole("button").filter({ hasText: /^\d{2}:\d{2}.*\d{2}:\d{2}$/ }).first().click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByPlaceholder("Seu nome").fill("Teste comercial demonstrativo");
  await page.getByPlaceholder("+55 (11) 9xxxx-xxxx").fill("5511000000000");
  const resultPromise = page.waitForResponse((r) => r.url().endsWith("/public/bookings") && r.request().method() === "POST");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  const result = await resultPromise;
  expect(result.status()).toBe(201);
  const booking = await result.json();
  expect(booking).toMatchObject({ serviceName: "Corte", professionalName: "João" });
  await expect(page.getByText(/Agendamento confirmado/i).first()).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("confirmed.png"), fullPage: true });
  const conflict = await request.post(`${api}/public/bookings`, { data: result.request().postDataJSON() });
  expect(conflict.status()).toBe(409);
  if (process.env.E2E_PRODUCTION !== "1") {
    const stored = await queryEvidence("SELECT status, tenant_id FROM bookings WHERE id = $1", [booking.id]);
    expect(stored).toEqual([{ status: "CONFIRMED", tenant_id: "demo-barbearia-dom-pedro-v1" }]);
  }
  const attribution = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), firstTouchKey);
  expect(attribution).toMatchObject({ prospectId, source: "outbound", medium: "whatsapp", campaign, landingPath: catalog });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await testInfo.attach("booking-evidence", { body: JSON.stringify({ bookingId: booking.id, prospectId, conflictStatus: conflict.status(), attribution }), contentType: "application/json" });
});

test("direct professional entry preserves outbound attribution on reload and signup navigation", async ({ page }) => {
  const prospectId = randomUUID();
  await page.goto(profile + tracking(prospectId));
  await expect(page.getByText("João", { exact: true }).first()).toBeVisible();
  const first = await page.evaluate((key) => localStorage.getItem(key), firstTouchKey);
  await page.reload();
  await page.getByRole("link", { name: /Criar a agenda da minha barbearia/ }).click();
  await page.waitForURL("**/signup");
  await page.goto("/signup" + tracking(randomUUID()));
  expect(await page.evaluate((key) => localStorage.getItem(key), firstTouchKey)).toBe(first);
});

function testCpf() {
  const digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  for (let length = 9; length <= 10; length++) {
    const remainder = digits.reduce((sum, digit, index) => sum + digit * (length + 1 - index), 0) % 11;
    digits.push(remainder < 2 ? 0 : 11 - remainder);
  }
  return digits.join("");
}

test("landing demo CTA through real signup preserves all five events and first-touch", async ({ page }, testInfo) => {
  test.skip(process.env.E2E_PRODUCTION === "1", "Signup production smoke is separately controlled.");
  const prospectId = randomUUID();
  const eventResponses: { status: number; payload: Record<string, unknown> }[] = [];
  page.on("response", (response) => {
    if (response.url().endsWith("/acquisition/events")) eventResponses.push({ status: response.status(), payload: response.request().postDataJSON() });
  });
  await page.goto("/" + tracking(prospectId));
  await page.getByRole("link", { name: "Testar demo de barbearia" }).click();
  await page.waitForURL(`**${catalog}`);
  await page.getByRole("link", { name: /Criar a agenda da minha barbearia/ }).click();
  await page.waitForURL("**/signup");
  await page.locator("#responsibleName").fill("Teste comercial");
  await page.locator("#signup-email").fill(`barbershop-${prospectId}@example.invalid`);
  await page.locator("#phone").fill("11000000000");
  await page.locator("#cpfCnpj").fill(testCpf());
  await page.locator("#companyName").fill(`Teste barbearia ${prospectId.slice(0, 8)}`);
  await page.locator("#signup-password").fill("Local-Test-Only!2026");
  await page.locator("#confirmPassword").fill("Local-Test-Only!2026");
  await page.getByRole("checkbox", { name: /Li e aceito/ }).check();
  const signupPromise = page.waitForResponse((r) => r.url().endsWith("/public/signup") && r.request().method() === "POST");
  const attributionPromise = page.waitForResponse((r) => r.url().endsWith("/acquisition/signup-attribution"));
  await page.getByRole("button", { name: "Criar minha conta" }).click();
  const signup = await signupPromise;
  expect(signup.status()).toBe(201);
  const result = await signup.json();
  expect((await attributionPromise).status()).toBe(204);
  // Navigation may detach a keepalive response from the old document; assert the persisted events.
  await expect.poll(async () => (await queryEvidence("SELECT DISTINCT event_name FROM acquisition_events WHERE prospect_id = $1::uuid", [prospectId])).map((e) => e.event_name).sort()).toEqual(["cta_click", "demo_click", "page_view", "signup_completed", "signup_started"]);
  const persisted = await queryEvidence("SELECT event_name, prospect_id, source, medium, campaign, landing_path, session_id, first_touch_at FROM acquisition_events WHERE prospect_id = $1::uuid", [prospectId]);
  const signupAttribution = await queryEvidence("SELECT metadata, session_id FROM tenant_activation_events WHERE tenant_id = $1 AND event_name = 'public_signup_completed'", [result.tenant.id]);
  expect(signupAttribution).toHaveLength(1);
  expect(signupAttribution[0].metadata).toMatchObject({ prospectId, source: "outbound", medium: "whatsapp", campaign, landingPath: "/" });
  for (const row of persisted) {
    expect(row).toMatchObject({ prospect_id: prospectId, source: "outbound", medium: "whatsapp", campaign, landing_path: "/", session_id: signupAttribution[0].session_id });
  }
  for (const event of eventResponses) expect(event.payload).toMatchObject({ prospectId, landingPath: "/", source: "outbound", medium: "whatsapp", campaign });
  await testInfo.attach("signup-attribution-evidence", { body: JSON.stringify({ tenantId: result.tenant.id, prospectId, events: eventResponses, persisted, signupAttribution }), contentType: "application/json" });
});
