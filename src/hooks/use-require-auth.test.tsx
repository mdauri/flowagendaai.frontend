import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { ApiError } from "@/types/api";

const navigateMock = vi.fn();
const logoutMock = vi.fn();

const authState = {
  token: "token-auth" as string | null,
  user: {
    id: "user-1",
    name: "Maria Souza",
    email: "maria@agendoro.com",
    role: "ADMIN",
  },
  tenant: {
    id: "tenant-1",
    name: "Agendoro Clinic",
    timezone: "America/Sao_Paulo",
  },
  isAuthenticated: true,
  isBootstrapping: false,
  error: null as unknown,
  logout: logoutMock,
  refetchCurrentUser: vi.fn(),
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => authState,
}));

describe("useRequireAuth", () => {
  beforeEach(() => {
    authState.token = "token-auth";
    authState.isAuthenticated = true;
    authState.isBootstrapping = false;
    authState.error = null;
    navigateMock.mockReset();
    logoutMock.mockReset();
  });

  test("redireciona para login quando nao ha token", () => {
    authState.token = null;
    authState.isAuthenticated = false;

    renderHook(() => useRequireAuth());

    expect(navigateMock).toHaveBeenCalledWith("/login", { replace: true });
  });

  test("encerra a sessao ao receber 401 de auth/me", () => {
    authState.error = new ApiError(401, "UNAUTHORIZED", "Sessao invalida", "req-auth");

    renderHook(() => useRequireAuth());

    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/login", { replace: true });
  });
});
