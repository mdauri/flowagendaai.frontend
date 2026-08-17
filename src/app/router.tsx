import { BrowserRouter, Navigate, Route, Routes } from "react-router";
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
import { ManageBookingPage } from "@/pages/manage-booking-page";
import { ResetPasswordPage } from "@/pages/reset-password-page";
import { ServicesPage } from "@/pages/services-page";
import { WaitlistPage } from "@/pages/waitlist-page";
import { SlotsPage } from "@/pages/slots-page";
import { SettingsPage } from "@/pages/settings-page";
import { BillingPage } from "@/pages/billing-page";
import { HolidaysPage } from "@/pages/holidays-page";
import { MeuDiaPage } from "@/pages/meu-dia-page";
import { SystemAdminTenantProvisionPage } from "@/pages/system-admin-tenant-provision-page";
import { SubscriptionPlansPage } from "@/pages/subscription-plans-page";
import { CustomerSubscriptionsPage } from "@/pages/customer-subscriptions-page";
import { CustomerAppHomePage } from "@/pages/customer-app-home-page";
import { CustomerAppBookingDetailPage } from "@/pages/customer-app-booking-detail-page";
import {
  MetaWhatsAppBillingSystemAdminPage,
  MetaWhatsAppBillingTenantPage,
} from "@/pages/meta-whatsapp-billing-page";
import { SystemAdminTenantControlCenterPage } from "@/pages/system-admin-tenant-control-center-page";
import { TermsPage } from "@/pages/terms-page";
import { ProfessionalServiceManager } from "@/components/professional-service-manager";
import { ProtectedRoute } from "@/components/app/protected-route";
import { getLastCustomerAppTenantSlug } from "@/session/customer-app-last-tenant-storage";
import { ForgotPage } from "../pages/forgot-password-page";
import { useAuth } from "@/hooks/use-auth";

function CustomerAppEntryBlockedPage() {
  const lastTenantSlug = getLastCustomerAppTenantSlug();

  if (lastTenantSlug) {
    return <Navigate to={`/c/${encodeURIComponent(lastTenantSlug)}`} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--bg-base) px-4">
      <div className="max-w-md rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-6 text-center">
        <h1 className="text-xl font-bold text-[var(--theme-text-primary)]">
          Nao foi possivel abrir este app.
        </h1>
        <p className="mt-2 text-sm text-text-soft">
          Use o link do estabelecimento para continuar.
        </p>
      </div>
    </div>
  );
}

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
        <Route path="/c" element={<CustomerAppEntryBlockedPage />} />
        <Route path="/c/:slug" element={<CustomerAppHomePage />} />
        <Route path="/c/:slug/bookings/:bookingId" element={<CustomerAppBookingDetailPage />} />
        <Route path="/p/:slug" element={<PublicBookingPage />} />
        <Route path="/manage/:token" element={<ManageBookingPage />} />
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
          <Route path="bookings" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="meu-dia" element={<MeuDiaPage />} />
          <Route path="minha-agenda" element={<Navigate to="/app/meu-dia" replace />} />
          <Route path="professionals" element={<ProfessionalsPage />} />
          <Route path="professionals/:professionalId/removal" element={<ProfessionalRemovalPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="waitlist" element={<WaitlistPage />} />
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
          <Route
            path="billing"
            element={
              <BlockProfessionalRoute>
                <BillingPage />
              </BlockProfessionalRoute>
            }
          />
          <Route path="system-admin/tenants/central" element={<SystemAdminTenantControlCenterPage />} />
          <Route path="api-tokens" element={<Navigate to="/app/system-admin/tenants/central?tab=api-tokens" replace />} />
          <Route path="system-admin/tenants/deposit-fee" element={<Navigate to="/app/system-admin/tenants/central?tab=deposit-fee" replace />} />
          <Route path="system-admin/tenants/subscription-club" element={<Navigate to="/app/system-admin/tenants/central?tab=subscription-club" replace />} />
          <Route path="system-admin/tenants/provision" element={<SystemAdminTenantProvisionPage />} />
          <Route path="system-admin/tenants/whatsapp" element={<Navigate to="/app/system-admin/tenants/central?tab=whatsapp" replace />} />
          <Route path="system-admin/meta-whatsapp" element={<MetaWhatsAppBillingSystemAdminPage />} />
          <Route path="meta-whatsapp" element={<MetaWhatsAppBillingTenantPage />} />
          <Route path="subscription-club/plans" element={<SubscriptionPlansPage />} />
          <Route path="subscription-club/subscribers" element={<CustomerSubscriptionsPage />} />
          <Route path="*" element={<AppIndexRedirect />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
