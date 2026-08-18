import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, test, vi } from "vitest";
import { ThemeProvider } from "@/theme/theme-provider";
import { LandingPage } from "./landing-page";

function renderLandingPage() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe("LandingPage", () => {
  test("aponta CTAs primarios de trial para signup publico", () => {
    renderLandingPage();

    const trialLinks = screen.getAllByRole("link", {
      name: "Testar grátis por 14 dias",
    });

    expect(trialLinks.length).toBeGreaterThanOrEqual(3);
    trialLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/signup");
    });
  });

  test("comunica pricing de lancamento e adicional WhatsApp", () => {
    renderLandingPage();

    expect(document.body).toHaveTextContent("R$ 97/mês");
    expect(document.body).toHaveTextContent("R$ 970/ano");
    expect(document.body).toHaveTextContent("pague 10 meses e use 12");
    expect(document.body).toHaveTextContent("+ R$ 100/mês");
    expect(document.body).toHaveTextContent("Agendoro + WhatsApp: R$ 197/mês");
    expect(document.body).toHaveTextContent(
      "Custos de mensagens cobrados pela Meta não estão incluídos."
    );
    expect(screen.getByRole("link", { name: "Falar sobre o adicional" })).toHaveAttribute(
      "href",
      expect.stringContaining("https://wa.me/")
    );
  });

  test("remove claims e provas sociais antigas sem evidencia", () => {
    renderLandingPage();

    expect(document.body).not.toHaveTextContent("zero furo");
    expect(document.body).not.toHaveTextContent("Essencial");
    expect(document.body).not.toHaveTextContent("Pro (Automação)");
    expect(document.body).not.toHaveTextContent("em até 48 horas");
    expect(document.body).not.toHaveTextContent("+2.500");
    expect(document.body).not.toHaveTextContent("+120");
    expect(document.body).not.toHaveTextContent("Marina S.");
    expect(document.body).not.toHaveTextContent("Carlos R.");
    expect(document.body).not.toHaveTextContent("Fernanda L.");
  });

  test("dispara evento local ao clicar no CTA de trial", async () => {
    const user = userEvent.setup();
    const listener = vi.fn();
    window.addEventListener("agendoro:landing-event", listener);

    renderLandingPage();

    await user.click(
      screen.getAllByRole("link", { name: "Testar grátis por 14 dias" })[0]
    );

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          name: "landing_trial_cta_clicked",
          payload: {
            sourceSection: "hero",
            target: "/signup",
            planContext: "agendoro",
          },
        },
      })
    );

    window.removeEventListener("agendoro:landing-event", listener);
  });
});
