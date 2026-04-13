import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { ApiError } from "@/types/api";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { renderWithProviders } from "@/test/render";

const mutateAsyncMock = vi.fn();

const resetPasswordMutationState = {
  error: null as unknown,
  isPending: false,
  isSuccess: false,
};

vi.mock("@/hooks/use-reset-password-mutation", () => ({
  useResetPasswordMutation: () => ({
    mutateAsync: mutateAsyncMock,
    error: resetPasswordMutationState.error,
    isPending: resetPasswordMutationState.isPending,
    isSuccess: resetPasswordMutationState.isSuccess,
  }),
}));

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    resetPasswordMutationState.error = null;
    resetPasswordMutationState.isPending = false;
    resetPasswordMutationState.isSuccess = false;
    mutateAsyncMock.mockReset();
  });

  test("renderiza o formulario quando ha token valido na url", () => {
    renderWithProviders(<ResetPasswordForm />, {
      withRouter: true,
      route: "/reset-password?token=token-valido",
    });

    expect(screen.getByRole("heading", { name: "Definir nova senha" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nova senha")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar nova senha")).toBeInTheDocument();
    expect(screen.queryByText("Link invalido")).not.toBeInTheDocument();
  });

  test("trata ausencia de token como link invalido", () => {
    renderWithProviders(<ResetPasswordForm />, {
      withRouter: true,
      route: "/reset-password",
    });

    expect(screen.getByText("Link invalido")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Este link de redefinicao nao e valido. Solicite um novo link para continuar."
      )
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Nova senha")).not.toBeInTheDocument();
  });

  test("envia token e nova senha no submit", async () => {
    const user = userEvent.setup();
    mutateAsyncMock.mockResolvedValue({
      message: "Senha redefinida com sucesso.",
    });

    renderWithProviders(<ResetPasswordForm />, {
      withRouter: true,
      route: "/reset-password?token=token-valido",
    });

    await user.type(screen.getByLabelText("Nova senha"), "NovaSenha123");
    await user.type(screen.getByLabelText("Confirmar nova senha"), "NovaSenha123");
    await user.click(screen.getByRole("button", { name: "Redefinir senha" }));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        token: "token-valido",
        newPassword: "NovaSenha123",
      });
    });
  });

  test("desabilita campos e botao durante loading", () => {
    resetPasswordMutationState.isPending = true;

    renderWithProviders(<ResetPasswordForm />, {
      withRouter: true,
      route: "/reset-password?token=token-valido",
    });

    expect(screen.getByLabelText("Nova senha")).toBeDisabled();
    expect(screen.getByLabelText("Confirmar nova senha")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Redefinindo senha..." })).toBeDisabled();
  });

  test("mostra sucesso apos redefinicao", () => {
    resetPasswordMutationState.isSuccess = true;

    renderWithProviders(<ResetPasswordForm />, {
      withRouter: true,
      route: "/reset-password?token=token-valido",
    });

    expect(screen.getByText("Senha atualizada")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Sua senha foi redefinida com sucesso. Voce ja pode entrar com a nova senha."
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir para o login" })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  test("mostra erro de token invalido", () => {
    resetPasswordMutationState.error = new ApiError(
      401,
      "INVALID_RESET_TOKEN",
      "Token invalido.",
      "req-invalid-token"
    );

    renderWithProviders(<ResetPasswordForm />, {
      withRouter: true,
      route: "/reset-password?token=token-valido",
    });

    expect(screen.getByText("Link invalido")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Solicitar novo link" })).toHaveAttribute(
      "href",
      "/forgot-password"
    );
  });

  test("mostra erro de token expirado", () => {
    resetPasswordMutationState.error = new ApiError(
      400,
      "RESET_TOKEN_EXPIRED",
      "Token expirado.",
      "req-expired-token"
    );

    renderWithProviders(<ResetPasswordForm />, {
      withRouter: true,
      route: "/reset-password?token=token-valido",
    });

    expect(screen.getByText("Link expirado")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Este link expirou por seguranca. Solicite um novo link para redefinir sua senha."
      )
    ).toBeInTheDocument();
  });

  test("mostra instrucoes quando a senha e fraca", () => {
    resetPasswordMutationState.error = new ApiError(
      400,
      "WEAK_PASSWORD",
      "A nova senha deve ter no minimo 8 caracteres, com pelo menos uma letra e um numero.",
      "req-weak-password"
    );

    renderWithProviders(<ResetPasswordForm />, {
      withRouter: true,
      route: "/reset-password?token=token-valido",
    });

    expect(screen.getByText("Senha invalida")).toBeInTheDocument();
    expect(
      screen.getByText(
        "A senha deve ter no minimo 8 caracteres e incluir pelo menos uma letra e um numero."
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nova senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Redefinir senha" })).toBeInTheDocument();
  });

  test("mostra erro generico de redefinicao", () => {
    resetPasswordMutationState.error = new ApiError(
      500,
      "INTERNAL_SERVER_ERROR",
      "Falha",
      "req-reset-error"
    );

    renderWithProviders(<ResetPasswordForm />, {
      withRouter: true,
      route: "/reset-password?token=token-valido",
    });

    expect(screen.getByText("Nao foi possivel redefinir")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Tente novamente em instantes. Se o problema continuar, solicite um novo link de redefinicao."
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nova senha")).toBeInTheDocument();
  });
});
