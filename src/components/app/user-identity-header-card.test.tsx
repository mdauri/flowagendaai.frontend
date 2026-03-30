import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { UserIdentityHeaderCard } from "@/components/app/user-identity-header-card";
import { renderWithProviders } from "@/test/render";

describe("UserIdentityHeaderCard", () => {
  test("renderiza nome, saudacao e aciona logout", async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();

    renderWithProviders(
      <UserIdentityHeaderCard name="Maria Souza" onLogout={onLogout} />
    );

    expect(screen.getByText("Bem-vindo de volta")).toBeInTheDocument();
    expect(screen.getByText("Maria Souza")).toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sair" }));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  test("aplica fallback seguro quando o nome esta ausente", () => {
    renderWithProviders(<UserIdentityHeaderCard name="" onLogout={vi.fn()} />);

    const fallbackName = screen.getByText("Usuario");

    expect(fallbackName).toBeInTheDocument();
    expect(fallbackName).toHaveAttribute("title", "Usuario");
    expect(screen.getByText("U")).toBeInTheDocument();
  });

  test("renderiza skeleton durante o loading", () => {
    renderWithProviders(<UserIdentityHeaderCard isLoading onLogout={vi.fn()} />);

    expect(
      screen.getByLabelText("Carregando identidade do usuario")
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sair" })).not.toBeInTheDocument();
  });

  test("mantem o nome truncavel para casos longos", () => {
    const longName = "Nome muito grande para ocupar o header inteiro com folga";

    renderWithProviders(<UserIdentityHeaderCard name={longName} onLogout={vi.fn()} />);

    expect(screen.getByText(longName)).toHaveClass("truncate");
    expect(screen.getByText(longName)).toHaveAttribute("title", longName);
  });
});
