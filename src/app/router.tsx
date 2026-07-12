import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppPage } from "@/pages/app-page";
import { AvailabilityPage } from "@/pages/availability-page";
import { CatalogPage } from "@/pages/catalog-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { LoginPage } from "@/pages/login-page";
import { LandingPage } from "@/pages/landing-page";
import { OrderHostEntryPage } from "@/pages/order-host-entry-page";
import { OrderSettingsPage } from "@/pages/order-settings-page";
import { ProfessionalsPage } from "@/pages/professionals-page";
import { ProductCategoriesPage } from "@/pages/product-categories-page";
import { ProductOrdersPage } from "@/pages/product-orders-page";
import { ProductsPage } from "@/pages/products-page";
import { ProductionPage } from "@/pages/production-page";
import { ProfessionalRemovalPage } from "@/pages/professional-removal-page";
import { PrivacyPolicyPage } from "@/pages/privacy-policy-page";
import { PublicBookingPage } from "@/pages/public-booking-page";
import { PublicOrderCheckoutPage } from "@/pages/public-order-checkout-page";
import { PublicOrderConfirmationPage } from "@/pages/public-order-confirmation-page";
import { PublicOrderMenuPage } from "@/pages/public-order-menu-page";
import { PublicOrderStorePage } from "@/pages/public-order-store-page";
import { ManageBookingPage } from "@/pages/manage-booking-page";
import { ResetPasswordPage } from "@/pages/reset-password-page";
import { ServicesPage } from "@/pages/services-page";
import { WaitlistPage } from "@/pages/waitlist-page";
import { SlotsPage } from "@/pages/slots-page";
import { SettingsPage } from "@/pages/settings-page";
import { HolidaysPage } from "@/pages/holidays-page";
import { MeuDiaPage } from "@/pages/meu-dia-page";
import { SystemAdminTenantProvisionPage } from "@/pages/system-admin-tenant-provision-page";
import { SubscriptionPlansPage } from "@/pages/subscription-plans-page";
import { CustomerSubscriptionsPage } from "@/pages/customer-subscriptions-page";
import {
  MetaWhatsAppBillingSystemAdminPage,
  MetaWhatsAppBillingTenantPage,
} from "@/pages/meta-whatsapp-billing-page";
import { SystemAdminTenantControlCenterPage } from "@/pages/system-admin-tenant-control-center-page";
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

function isOrderHost() {
  if (typeof window === "undefined") {
    return false;
  }

  const override = import.meta.env.VITE_ORDER_HOST_ENABLED?.trim().toLowerCase();

  if (override === "true") {
    return true;
  }

  if (override === "false") {
    return false;
  }

  return ["pedido.dauri.com.br", "localhost", "127.0.0.1"].includes(
    window.location.hostname,
  );
}

export function AppRouter() {
  const orderHost = isOrderHost();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={orderHost ? <OrderHostEntryPage /> : <LandingPage />} />
        <Route path="/termos-de-uso" element={<TermsPage />} />
        <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        {orderHost ? (
          <>
            <Route path="/:slug" element={<PublicOrderStorePage />} />
            <Route path="/:slug/cardapio" element={<PublicOrderMenuPage />} />
            <Route path="/:slug/pedido" element={<PublicOrderCheckoutPage />} />
            <Route path="/:slug/confirmacao/:orderNumber" element={<PublicOrderConfirmationPage />} />
          </>
        ) : (
          <>
            <Route path="/p/:slug" element={<PublicBookingPage />} />
            <Route path="/manage/:token" element={<ManageBookingPage />} />
            <Route path="/c/:slug/catalog" element={<CatalogPage />} />
          </>
        )}

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
          <Route path="orders/settings" element={<OrderSettingsPage />} />
          <Route path="orders/categories" element={<ProductCategoriesPage />} />
          <Route path="orders/products" element={<ProductsPage />} />
          <Route path="orders/list" element={<ProductOrdersPage />} />
          <Route path="orders/production" element={<ProductionPage />} />
          <Route
            path="settings"
            element={
              <BlockProfessionalRoute>
                <SettingsPage />
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
