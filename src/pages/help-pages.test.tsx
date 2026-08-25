import { describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { renderWithProviders } from "@/test/render";
import { HelpCenterPage } from "./help-center-page";
import { HelpArticlePage } from "./help-article-page";
import { HelpCategoryPage } from "./help-category-page";

describe("Help Center pages", () => {
  it("renders the public home and searches by content", () => {
    renderWithProviders(<HelpCenterPage />, { withRouter: true });
    expect(screen.getByRole("heading", { name: "Como podemos ajudar?" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Buscar na Central de Ajuda"), { target: { value: "bloquear horário" } });
    expect(screen.getByText("Bloquear horários e dias")).toBeInTheDocument();
  });

  it("renders category and article routes without authentication", () => {
    renderWithProviders(<MemoryRouter initialEntries={["/ajuda/agenda/visao-da-agenda"]}><Routes><Route path="/ajuda/:categorySlug" element={<HelpCategoryPage />} /><Route path="/ajuda/:categorySlug/:articleSlug" element={<HelpArticlePage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Visão da agenda" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Artigos relacionados" })).toBeInTheDocument();
  });

  it("loads the official video in the article and keeps written content", () => {
    renderWithProviders(<MemoryRouter initialEntries={["/ajuda/primeiros-passos/configurar-empresa"]}><Routes><Route path="/ajuda/:categorySlug/:articleSlug" element={<HelpArticlePage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Configurando sua empresa" })).toBeInTheDocument();
    expect(screen.getByLabelText("Veja como configurar os dados da empresa")).toHaveAttribute("src", "/onboarding-videos/company-data.webm");
    expect(screen.getByText("Essas informações aparecem para quem acessa sua agenda pública.")).toBeInTheDocument();
  });
});
