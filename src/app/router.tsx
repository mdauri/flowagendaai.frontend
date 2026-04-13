import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppPage } from "@/pages/app-page";
import { AvailabilityPage } from "@/pages/availability-page";
import { CatalogPage } from "@/pages/catalog-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { LoginPage } from "@/pages/login-page";
import { ProfessionalsPage } from "@/pages/professionals-page";
import { ProfessionalRemovalPage } from "@/pages/professional-removal-page";
import { PublicBookingPage } from "@/pages/public-booking-page";
import { ResetPasswordPage } from "@/pages/reset-password-page";
import { ServicesPage } from "@/pages/services-page";
import { SlotsPage } from "@/pages/slots-page";
import { SettingsPage } from "@/pages/settings-page";
import { SystemAdminTenantProvisionPage } from "@/pages/system-admin-tenant-provision-page";
import { ProfessionalServiceManager } from "@/components/professional-service-manager";
import { ProtectedRoute } from "@/components/app/protected-route";
import { ForgotPage } from "../pages/forgot-password-page";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/p/:slug" element={<PublicBookingPage />} />
        <Route path="/c/:slug/catalog" element={<CatalogPage />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="professionals" element={<ProfessionalsPage />} />
          <Route path="professionals/:professionalId/removal" element={<ProfessionalRemovalPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route
            path="services/:id/professionals"
            element={
              <ProtectedRoute>
                <ProfessionalServiceManager />
              </ProtectedRoute>
            }
          />
          <Route path="availability" element={<AvailabilityPage />} />
          <Route path="slots" element={<SlotsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="system-admin/tenants/provision" element={<SystemAdminTenantProvisionPage />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
