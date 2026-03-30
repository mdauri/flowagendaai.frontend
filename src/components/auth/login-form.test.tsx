import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { ApiError } from "@/types/api";
import { LoginForm } from "@/components/auth/login-form";
import { renderWithProviders } from "@/test/render";

const navigateMock = vi.fn();
const refetchCurrentUserMock = vi.fn();
const mutateAsyncMock = vi.fn();

const loginMutationState = {
  error: null as unknown,
  isPending: false,
  isSuccess: false,
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    refetchCurrentUser: refetchCurrentUserMock,
  }),
}));

vi.mock("@/hooks/use-login-mutation", () => ({
  useLoginMutation: () => ({
    mutateAsync: mutateAsyncMock,
    error: loginMutationState.error,
    isPending: loginMutationState.isPending,
    isSuccess: loginMutationState.isSuccess,
  }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    loginMutationState.error = null;
    loginMutationState.isPending = false;
    loginMutationState.isSuccess = false;
    mutateAsyncMock.mockReset();
    refetchCurrentUserMock.mockReset();
    navigateMock.mockReset();
  });

  test("mantem o erro visivel sem unhandled rejection em login invalido", async () => {
    const user = userEvent.setup();
    const apiError = new ApiError(
      401,
      "INVALID_CREDENTIALS",
      "Credenciais invalidas.",
      "req-invalid-login"
    );
    const unhandledRejections: unknown[] = [];

    loginMutationState.error = apiError;
    mutateAsyncMock.mockRejectedValue(apiError);

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      unhandledRejections.push(event.reason);
      event.preventDefault();
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection);

    try {
      renderWithProviders(<LoginForm />, { withRouter: true });

      await user.type(screen.getByLabelText("Email"), "invalid@agendoro.com");
      await user.type(screen.getByLabelText("Senha"), "senha-errada");
      await user.click(screen.getByRole("button", { name: "Entrar" }));

      expect(await screen.findByText("Nao foi possivel entrar")).toBeInTheDocument();
      expect(
        screen.getByText("Verifique seu email e senha e tente novamente.")
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(mutateAsyncMock).toHaveBeenCalledWith({
          email: "invalid@agendoro.com",
          password: "senha-errada",
        });
        expect(unhandledRejections).toHaveLength(0);
      });
    } finally {
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    }
  });

  test("continua navegando apos login valido", async () => {
    const user = userEvent.setup();

    loginMutationState.isSuccess = true;
    mutateAsyncMock.mockResolvedValue({
      accessToken: "token-smoke",
    });
    refetchCurrentUserMock.mockResolvedValue(undefined);

    renderWithProviders(<LoginForm />, { withRouter: true });

    await user.type(screen.getByLabelText("Email"), "admin@agendoro.com");
    await user.type(screen.getByLabelText("Senha"), "123456");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        email: "admin@agendoro.com",
        password: "123456",
      });
      expect(refetchCurrentUserMock).toHaveBeenCalled();
      expect(navigateMock).toHaveBeenCalledWith("/app", { replace: true });
    });
  });
});
