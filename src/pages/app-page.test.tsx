import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AppPage } from "@/pages/app-page";
import { renderWithProviders } from "@/test/render";

const logoutMock = vi.fn();

const authState = {
  token: "token-auth",
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
  error: null,
  logout: logoutMock,
  refetchCurrentUser: vi.fn(),
};

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => authState,
}));

describe("AppPage", () => {
  beforeEach(() => {
    logoutMock.mockReset();
  });

  test("redireciona para login ao acionar logout no header", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <MemoryRouter initialEntries={["/app"]}>
        <Routes>
          <Route path="/login" element={<div>Login screen</div>} />
          <Route path="/app" element={<AppPage />}>
            <Route index element={<div>App content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Sair" }));

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Login screen")).toBeInTheDocument();
    });
  });
});
