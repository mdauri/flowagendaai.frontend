import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, test } from "vitest";
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
  test("exibe precos comerciais do catalogo e CTAs seguros", () => {
    renderLandingPage();

    const trialLinks = screen.getAllByRole("link", { name: "Testar grátis por 14 dias" });
    expect(trialLinks.length).toBeGreaterThan(0);
    expect(trialLinks[0]).toHaveAttribute(
      "href",
      "/signup"
    );
    expect(document.body).toHaveTextContent("R$ 97");
    expect(document.body).toHaveTextContent("R$ 970/ano");
    expect(document.body).toHaveTextContent("Até 3 profissionais");
    expect(document.body).not.toHaveTextContent("ilimitado");
    expect(document.body).not.toHaveTextContent("Ilimitados");
    expect(document.body).toHaveTextContent("Profissional adicional: R$ 15/mês");
    expect(document.body).toHaveTextContent("+ R$ 100/mês");
    expect(document.body).toHaveTextContent("Implantação assistida: R$ 197");
    expect(document.body).toHaveTextContent("Implantação WhatsApp: R$ 297");
    expect(document.body).toHaveTextContent(
      "Reduza faltas e ganhe tempo com uma agenda online que trabalha por você"
    );
    expect(document.body).toHaveTextContent("Dúvidas frequentes");
    expect(document.body).toHaveTextContent("Faltas deixam dinheiro na mesa");
    expect(document.body).not.toHaveTextContent("Mais de 100 negócios");
  });

  test("preserva o CTA comercial do adicional WhatsApp", () => {
    renderLandingPage();

    expect(screen.getByRole("link", { name: "Falar sobre o adicional" })).toHaveAttribute(
      "href",
      expect.stringContaining("https://wa.me/")
    );
  });
});
