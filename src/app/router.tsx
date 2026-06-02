import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppPage } from "@/pages/app-page";
import { AvailabilityPage } from "@/pages/availability-page";
import { CatalogPage } from "@/pages/catalog-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { LoginPage } from "@/pages/login-page";
import { LandingPage } from "@/pages/landing-page";
import { ProfessionalsPage } from "@/pages/professionals-page";
import { ProfessionalRemovalPage } from "@/pages/professional-removal-page";
import { PrivacyPolicyPage } from "@/pages/privacy-policy-page";
import { PublicBookingPage } from "@/pages/public-booking-page";
import { ResetPasswordPage } from "@/pages/reset-password-page";
import { ServicesPage } from "@/pages/services-page";
import { SlotsPage } from "@/pages/slots-page";
import { SettingsPage } from "@/pages/settings-page";
import { ApiTokensPage } from "@/pages/api-tokens-page";
import { BookingsPage } from "@/pages/bookings-page";
import { HolidaysPage } from "@/pages/holidays-page";
import { MeuDiaPage } from "@/pages/meu-dia-page";
import { SystemAdminTenantProvisionPage } from "@/pages/system-admin-tenant-provision-page";
import { SystemAdminTenantWhatsAppPage } from "@/pages/system-admin-tenant-whatsapp-page";
import {
  MetaWhatsAppBillingSystemAdminPage,
  MetaWhatsAppBillingTenantPage,
} from "@/pages/meta-whatsapp-billing-page";
import { TermsPage } from "@/pages/terms-page";
import { ProfessionalServiceManager } from "@/components/professional-service-manager";
import { ProtectedRoute } from "@/components/app/protected-route";
import { ForgotPage } from "../pages/forgot-password-page";
import { useAuth } from "@/hooks/use-auth";

function AppIndexRedirect() {
  const auth = useAuth();

  if (!auth.user) {
    return <Navigate to="dashboard" replace />;
  }

  return auth.user.role === "professional" ? (
    <Navigate to="meu-dia" replace />
  ) : (
    <Navigate to="dashboard" replace />
  );
}

function BlockProfessionalRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  if (auth.user?.role === "professional") {
    return <Navigate to="/app/meu-dia" replace />;
  }

  return <>{children}</>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/termos-de-uso" element={<TermsPage />} />
        <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/p/:slug" element={<PublicBookingPage />} />
        <Route path="/c/:slug/catalog" element={<CatalogPage />} />

        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <AppPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<AppIndexRedirect />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="meu-dia" element={<MeuDiaPage />} />
          <Route path="minha-agenda" element={<Navigate to="/app/meu-dia" replace />} />
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
          <Route path="holidays" element={<HolidaysPage />} />
          <Route
            path="settings"
            element={
              <BlockProfessionalRoute>
                <SettingsPage />
              </BlockProfessionalRoute>
            }
          />
          <Route path="api-tokens" element={<ApiTokensPage />} />
          <Route path="system-admin/tenants/provision" element={<SystemAdminTenantProvisionPage />} />
          <Route path="system-admin/tenants/whatsapp" element={<SystemAdminTenantWhatsAppPage />} />
          <Route path="system-admin/meta-whatsapp" element={<MetaWhatsAppBillingSystemAdminPage />} />
          <Route path="meta-whatsapp" element={<MetaWhatsAppBillingTenantPage />} />
          <Route path="*" element={<AppIndexRedirect />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
