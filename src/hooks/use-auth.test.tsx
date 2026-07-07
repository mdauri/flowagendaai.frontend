import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useAuth } from "@/hooks/use-auth";
import { createTestQueryClient } from "@/test/render";
import { ApiError } from "@/types/api";

let storedToken: string | null = null;
const tokenListeners = new Set<() => void>();

type CurrentUserQueryState = {
  data:
    | {
        user: {
          id: string;
          name: string;
          email: string;
          role: string;
          professionalId: null;
        };
        tenant: {
          id: string;
          name: string;
          timezone: string;
          slug: string;
        };
      }
    | undefined;
  isLoading: boolean;
  error: ApiError | null;
  refetch: ReturnType<typeof vi.fn>;
};

const currentUserQueryState: CurrentUserQueryState = {
  data: {
    user: {
      id: "user-1",
      name: "Maria Souza",
      email: "maria@agendoro.com",
      role: "ADMIN",
      professionalId: null,
    },
    tenant: {
      id: "tenant-1",
      name: "Agendoro Clinic",
      timezone: "America/Sao_Paulo",
      slug: "clinic",
    },
  },
  isLoading: false,
  error: null,
  refetch: vi.fn(),
};

vi.mock("@/hooks/use-current-user", () => ({
  useCurrentUser: () => currentUserQueryState,
}));

vi.mock("@/session/session-storage", () => ({
  getStoredToken: () => storedToken,
  setStoredToken: (token: string) => {
    storedToken = token;

    for (const listener of tokenListeners) {
      listener();
    }
  },
  clearStoredToken: () => {
    storedToken = null;

    for (const listener of tokenListeners) {
      listener();
    }
  },
  subscribeToStoredToken: (listener: () => void) => {
    tokenListeners.add(listener);

    return () => {
      tokenListeners.delete(listener);
    };
  },
}));

describe("useAuth", () => {
  beforeEach(() => {
    storedToken = "token-auth";
    tokenListeners.clear();
    currentUserQueryState.data = {
      user: {
        id: "user-1",
        name: "Maria Souza",
        email: "maria@agendoro.com",
        role: "ADMIN",
        professionalId: null,
      },
      tenant: {
        id: "tenant-1",
        name: "Agendoro Clinic",
        timezone: "America/Sao_Paulo",
        slug: "clinic",
      },
    };
    currentUserQueryState.isLoading = false;
    currentUserQueryState.error = null;
    currentUserQueryState.refetch.mockReset();
  });

  test("limpa token e cache ao fazer logout", () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["dashboard"], { total: 3 });

    function Wrapper({ children }: PropsWithChildren) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }

    const { result } = renderHook(() => useAuth(), {
      wrapper: Wrapper,
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe("token-auth");

    act(() => {
      result.current.logout();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(queryClient.getQueryCache().findAll()).toHaveLength(0);
  });

  test("invalida sessao local ao receber 401 de auth/me", async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["dashboard"], { total: 3 });
    currentUserQueryState.data = undefined;
    currentUserQueryState.error = new ApiError(401, "UNAUTHORIZED", "Sessao invalida", "req-auth");

    function Wrapper({ children }: PropsWithChildren) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }

    const { result, rerender } = renderHook(() => useAuth(), {
      wrapper: Wrapper,
    });

    rerender();

    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(queryClient.getQueryCache().findAll()).toHaveLength(0);
  });
});
