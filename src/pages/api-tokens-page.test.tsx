import { screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { ApiTokensPage } from "@/pages/api-tokens-page";
import { renderWithProviders } from "@/test/render";

function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location">
      {location.pathname}
      {location.search}
    </div>
  );
}

describe("ApiTokensPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("redireciona para a central de tenants com a aba de API Tokens", () => {
    renderWithProviders(
      <MemoryRouter initialEntries={["/app/api-tokens"]}>
        <Routes>
          <Route path="/app/api-tokens" element={<ApiTokensPage />} />
          <Route
            path="/app/system-admin/tenants/central"
            element={<LocationProbe />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("location")).toHaveTextContent(
      "/app/system-admin/tenants/central?tab=api-tokens",
    );
  });
});
