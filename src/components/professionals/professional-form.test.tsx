import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProfessionalForm } from "@/components/professionals/professional-form";
import { renderWithProviders } from "@/test/render";

describe("ProfessionalForm", () => {
  it("renderiza o modo de criacao com a CTA correta", () => {
    renderWithProviders(
      <ProfessionalForm
        mode="create"
        isSubmitting={false}
        onCreateSubmit={vi.fn()}
        onEditSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Novo profissional" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Criar profissional" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Limpar" })).toBeInTheDocument();
  });

  it("preenche os dados e exibe a acao de cancelamento no modo de edicao", async () => {
    const user = userEvent.setup();
    const onCancelEdit = vi.fn();

    renderWithProviders(
      <ProfessionalForm
        mode="edit"
        initialValues={{
          id: "professional-1",
          name: "Ana Souza",
          slug: "ana-souza",
          description: "Especialista em coloracao.",
          imageUrl: null,
          thumbnailUrl: null,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        }}
        isSubmitting={false}
        onCreateSubmit={vi.fn()}
        onEditSubmit={vi.fn()}
        onCancelEdit={onCancelEdit}
      />,
    );

    expect(screen.getByRole("heading", { name: "Editar profissional" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nome completo")).toHaveValue("Ana Souza");
    expect(screen.getByRole("textbox", { name: /Descricao \(opcional\)/ })).toHaveValue(
      "Especialista em coloracao.",
    );
    expect(screen.getByRole("button", { name: "Salvar alteracoes" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancelar edicao" }));
    expect(onCancelEdit).toHaveBeenCalledTimes(1);
  });
});
