import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, test } from "vitest";
import { ThemeProvider } from "@/theme/theme-provider";
import { CommercialSeoPage } from "./commercial-seo-page";

describe("CommercialSeoPage", () => {
  test.each([
    ["system", "Sistema de agendamento online para organizar seu negócio"],
    ["automotive", "Agenda online para estética automotiva"],
    ["salon", "Agenda online para salão de beleza"],
  ] as const)("renderiza conteúdo específico em %s", (pageKey, h1) => {
    render(<ThemeProvider><MemoryRouter><CommercialSeoPage pageKey={pageKey} /></MemoryRouter></ThemeProvider>);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(h1);
    expect(screen.getAllByRole("link", { name: /Começar meu teste grátis|Testar grátis por 14 dias|Criar minha agenda|Organizar meu salão/ }).some((link) => link.getAttribute("href") === "/signup")).toBe(true);
    expect(screen.getAllByText("14 dias grátis, sem cartão.").length).toBeGreaterThan(0);
  });

  test("mantém demonstração real no catálogo público de estética", () => {
    render(<ThemeProvider><MemoryRouter><CommercialSeoPage pageKey="automotive" /></MemoryRouter></ThemeProvider>);

    expect(screen.getByRole("link", { name: "Ver demonstração" })).toHaveAttribute("href", "/c/demo/catalog");
    expect(screen.getByText("Vitrificação")).toBeInTheDocument();
    expect(screen.getByText("Lavagem de SUV e caminhonete")).toBeInTheDocument();
  });
});
