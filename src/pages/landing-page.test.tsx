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
  test("aponta CTAs primarios de trial para signup publico", () => {
    renderLandingPage();

    expect(screen.getByRole("link", { name: "Organizar minha agenda" })).toHaveAttribute(
      "href",
      "/signup"
    );
    expect(screen.getByRole("link", { name: "Começar no Essencial" })).toHaveAttribute(
      "href",
      "/signup"
    );
  });

  test("preserva CTAs secundarios e automacao fora do signup", () => {
    renderLandingPage();

    expect(screen.getByRole("link", { name: "Ver benefícios" })).toHaveAttribute(
      "href",
      "#beneficios"
    );
    expect(screen.getByRole("link", { name: "Escolher Automação Pro" })).toHaveAttribute(
      "href",
      expect.stringContaining("https://wa.me/")
    );
  });
});
