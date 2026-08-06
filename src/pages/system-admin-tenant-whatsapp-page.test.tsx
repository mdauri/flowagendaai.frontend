import { screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { SystemAdminTenantWhatsAppPage } from "@/pages/system-admin-tenant-whatsapp-page";
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

describe("SystemAdminTenantWhatsAppPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("redireciona para a central de tenants com a aba de WhatsApp", () => {
    renderWithProviders(
      <MemoryRouter initialEntries={["/app/system-admin/tenants/whatsapp"]}>
        <Routes>
          <Route
            path="/app/system-admin/tenants/whatsapp"
            element={<SystemAdminTenantWhatsAppPage />}
          />
          <Route
            path="/app/system-admin/tenants/central"
            element={<LocationProbe />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("location")).toHaveTextContent(
      "/app/system-admin/tenants/central?tab=whatsapp",
    );
  });
});
