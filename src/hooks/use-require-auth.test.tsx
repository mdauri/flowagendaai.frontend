import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { ApiError } from "@/types/api";

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

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => authState,
}));

describe("useRequireAuth", () => {
  beforeEach(() => {
    authState.token = "token-auth";
    authState.isAuthenticated = true;
    authState.isBootstrapping = false;
    authState.error = null;
    logoutMock.mockReset();
  });

  test("nao encerra sessao apenas por ausencia de token", () => {
    authState.token = null;
    authState.isAuthenticated = false;

    renderHook(() => useRequireAuth());

    expect(logoutMock).not.toHaveBeenCalled();
  });

  test("nao dispara side effect ao receber 401 de auth/me", () => {
    authState.error = new ApiError(401, "UNAUTHORIZED", "Sessao invalida", "req-auth");

    const { result } = renderHook(() => useRequireAuth());

    expect(result.current.error).toBeInstanceOf(ApiError);
    expect(logoutMock).not.toHaveBeenCalled();
  });
});
