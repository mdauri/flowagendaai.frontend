import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { ApiError } from "@/types/api";
import { ForgotForm } from "@/components/auth/forgot-password-form";
import { renderWithProviders } from "@/test/render";

const mutateAsyncMock = vi.fn();

const forgotMutationState = {
  error: null as unknown,
  isPending: false,
  isSuccess: false,
};

vi.mock("@/hooks/use-forgot-mutation", () => ({
  useForgotMutation: () => ({
    mutateAsync: mutateAsyncMock,
    error: forgotMutationState.error,
    isPending: forgotMutationState.isPending,
    isSuccess: forgotMutationState.isSuccess,
  }),
}));

describe("ForgotForm", () => {
  beforeEach(() => {
    forgotMutationState.error = null;
    forgotMutationState.isPending = false;
    forgotMutationState.isSuccess = false;
    mutateAsyncMock.mockReset();
  });

  test("renderiza a tela padrao de recuperacao", () => {
    renderWithProviders(<ForgotForm />, { withRouter: true });

    expect(screen.getByRole("heading", { name: "Recuperar acesso" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Informe o e-mail da sua conta para receber um link seguro de redefinicao de senha."
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Enviar link de redefinicao" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar para o login" })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  test("envia apenas o email informado", async () => {
    const user = userEvent.setup();
    mutateAsyncMock.mockResolvedValue({
      message:
        "Se o e-mail informado estiver cadastrado, voce recebera um link para redefinir sua senha.",
    });

    renderWithProviders(<ForgotForm />, { withRouter: true });

    await user.type(screen.getByLabelText("E-mail"), "admin@agendoro.com");
    await user.click(screen.getByRole("button", { name: "Enviar link de redefinicao" }));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        email: "admin@agendoro.com",
      });
    });
  });

  test("desabilita submissao durante loading", () => {
    forgotMutationState.isPending = true;

    renderWithProviders(<ForgotForm />, { withRouter: true });

    expect(screen.getByLabelText("E-mail")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Enviando link..." })).toBeDisabled();
  });

  test("mostra sucesso neutro apos submit bem-sucedido", () => {
    forgotMutationState.isSuccess = true;

    renderWithProviders(<ForgotForm />, { withRouter: true });

    expect(screen.getByText("Verifique seu e-mail")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Se o e-mail informado estiver cadastrado, voce recebera um link para redefinir sua senha."
      )
    ).toBeInTheDocument();
  });

  test("mostra erro generico em falha da requisicao", () => {
    forgotMutationState.error = new ApiError(
      500,
      "INTERNAL_SERVER_ERROR",
      "Falha",
      "req-forgot-error"
    );

    renderWithProviders(<ForgotForm />, { withRouter: true });

    expect(screen.getByText("Nao foi possivel continuar")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Tente novamente em instantes. Se o problema continuar, revise o e-mail informado ou tente mais tarde."
      )
    ).toBeInTheDocument();
  });
});
