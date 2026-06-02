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
    professionalId: null,
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
    expect(screen.getByRole("link", { name: "WhatsApp" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Profissionais" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Servicos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Disponibilidade" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Slots" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Configuracoes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Provisionamento" })).toBeInTheDocument();
  });

  test("nao exibe API Tokens para admin", () => {
    renderShell("admin");

    expect(screen.queryByRole("link", { name: "API Tokens" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "WhatsApp" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Meu Dia" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
  });

  test("role professional exibe Meu Dia e oculta links operacionais", () => {
    renderShell("professional");

    expect(screen.getByRole("link", { name: "Meu Dia" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Bookings" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Dashboard" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Profissionais" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Servicos" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Configuracoes" })).not.toBeInTheDocument();
  });
});
