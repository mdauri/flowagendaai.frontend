import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import { AppShell } from "@/components/app/app-shell";
import type { AuthTenant, AuthUser } from "@/types/auth";
import { renderWithProviders } from "@/test/render";

const tenant: AuthTenant = {
  id: "tenant-1",
  name: "Agendoro Clinic",
  timezone: "America/Sao_Paulo",
  logoUrl: null,
  coverImageUrl: null,
  publicAddress: null,
};

function renderShell(role: string) {
  const user: AuthUser = {
    id: "user-1",
    name: "User Test",
    email: "user@test.com",
    role,
  };

  return renderWithProviders(
    <MemoryRouter initialEntries={["/app/dashboard"]}>
      <AppShell user={user} tenant={tenant} onLogout={vi.fn()}>
        <div>Conteudo</div>
      </AppShell>
    </MemoryRouter>
  );
}

describe("AppShell", () => {
  test("exibe API Tokens e demais botoes para system-admin", () => {
    renderShell("system-admin");

    expect(screen.getByRole("link", { name: "API Tokens" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Profissionais" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Servicos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Disponibilidade" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Slots" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Configuracoes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Provisionamento" })).toBeInTheDocument();
  });

  test("nao exibe API Tokens para mandant", () => {
    renderShell("mandant");

    expect(screen.queryByRole("link", { name: "API Tokens" })).not.toBeInTheDocument();
  });

  test("nao exibe API Tokens para admin", () => {
    renderShell("admin");

    expect(screen.queryByRole("link", { name: "API Tokens" })).not.toBeInTheDocument();
  });
});
