import { screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { AuthShell } from "@/components/auth/auth-shell";
import { renderWithProviders } from "@/test/render";

describe("AuthShell", () => {
  test("renderiza copy publica sem linguagem tecnica", () => {
    renderWithProviders(
      <AuthShell>
        <div>Formulario</div>
      </AuthShell>,
    );

    expect(screen.getByText("Acesse sua área profissional")).toBeInTheDocument();
    expect(screen.getByText("Gestão simples")).toBeInTheDocument();
    expect(screen.getByText("Agenda, profissionais e serviços em um só lugar.")).toBeInTheDocument();
    expect(screen.queryByText(/Fluxo inicial/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/auth\/me/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/shell autenticado/i)).not.toBeInTheDocument();
  });
});
