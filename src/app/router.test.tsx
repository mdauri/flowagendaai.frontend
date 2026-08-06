import { screen } from "@testing-library/react";
import { Outlet, useLocation, useSearchParams } from "react-router";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AppRouter } from "@/app/router";
import { renderWithProviders } from "@/test/render";

const authState = {
  token: null as string | null,
  user: null as
    | {
        id: string;
        name: string;
        email: string;
        role: "ADMIN" | "professional";
        professionalId: string | null;
      }
    | null,
  tenant: null as
    | {
        id: string;
        name: string;
        timezone: string;
        slug: string;
      }
    | null,
  isAuthenticated: false,
  isBootstrapping: false,
  error: null as unknown,
  logout: vi.fn(),
  refetchCurrentUser: vi.fn(),
};

const getLastCustomerAppTenantSlugMock = vi.fn<() => string | null>(() => null);

function RouteDebug({ label }: { label: string }) {
  const location = useLocation();

  return (
    <div>
      <span>{label}</span>
      <span data-testid="route-pathname">{location.pathname}</span>
      <span data-testid="route-search">{location.search}</span>
    </div>
  );
}

function SystemAdminCentralPageMock() {
  const [searchParams] = useSearchParams();

  return (
    <div>
      <span>system-admin-central</span>
      <span data-testid="route-tab">{searchParams.get("tab") ?? ""}</span>
    </div>
  );
}

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => authState,
}));

vi.mock("@/hooks/use-require-auth", () => ({
  useRequireAuth: () => authState,
}));

vi.mock("@/session/customer-app-last-tenant-storage", () => ({
  getLastCustomerAppTenantSlug: () => getLastCustomerAppTenantSlugMock(),
}));

vi.mock("@/pages/app-page", () => ({
  AppPage: () => (
    <div>
      <span>app-shell</span>
      <Outlet />
    </div>
  ),
}));

vi.mock("@/pages/landing-page", () => ({
  LandingPage: () => <RouteDebug label="landing-page" />,
}));

vi.mock("@/pages/terms-page", () => ({
  TermsPage: () => <RouteDebug label="terms-page" />,
}));

vi.mock("@/pages/privacy-policy-page", () => ({
  PrivacyPolicyPage: () => <RouteDebug label="privacy-policy-page" />,
}));

vi.mock("@/pages/login-page", () => ({
  LoginPage: () => <RouteDebug label="login-page" />,
}));

vi.mock("../pages/forgot-password-page", () => ({
  ForgotPage: () => <RouteDebug label="forgot-password-page" />,
}));

vi.mock("@/pages/reset-password-page", () => ({
  ResetPasswordPage: () => <RouteDebug label="reset-password-page" />,
}));

vi.mock("@/pages/customer-app-home-page", () => ({
  CustomerAppHomePage: () => <RouteDebug label="customer-app-home-page" />,
}));

vi.mock("@/pages/customer-app-booking-detail-page", () => ({
  CustomerAppBookingDetailPage: () => <RouteDebug label="customer-app-booking-detail-page" />,
}));

vi.mock("@/pages/public-booking-page", () => ({
  PublicBookingPage: () => <RouteDebug label="public-booking-page" />,
}));

vi.mock("@/pages/manage-booking-page", () => ({
  ManageBookingPage: () => <RouteDebug label="manage-booking-page" />,
}));

vi.mock("@/pages/catalog-page", () => ({
  CatalogPage: () => <RouteDebug label="catalog-page" />,
}));

vi.mock("@/pages/dashboard-page", () => ({
  DashboardPage: () => <RouteDebug label="dashboard-page" />,
}));

vi.mock("@/pages/meu-dia-page", () => ({
  MeuDiaPage: () => <RouteDebug label="meu-dia-page" />,
}));

vi.mock("@/pages/professionals-page", () => ({
  ProfessionalsPage: () => <RouteDebug label="professionals-page" />,
}));

vi.mock("@/pages/professional-removal-page", () => ({
  ProfessionalRemovalPage: () => <RouteDebug label="professional-removal-page" />,
}));

vi.mock("@/pages/services-page", () => ({
  ServicesPage: () => <RouteDebug label="services-page" />,
}));

vi.mock("@/pages/waitlist-page", () => ({
  WaitlistPage: () => <RouteDebug label="waitlist-page" />,
}));

vi.mock("@/components/professional-service-manager", () => ({
  ProfessionalServiceManager: () => <RouteDebug label="professional-service-manager" />,
}));

vi.mock("@/pages/availability-page", () => ({
  AvailabilityPage: () => <RouteDebug label="availability-page" />,
}));

vi.mock("@/pages/slots-page", () => ({
  SlotsPage: () => <RouteDebug label="slots-page" />,
}));

vi.mock("@/pages/holidays-page", () => ({
  HolidaysPage: () => <RouteDebug label="holidays-page" />,
}));

vi.mock("@/pages/settings-page", () => ({
  SettingsPage: () => <RouteDebug label="settings-page" />,
}));

vi.mock("@/pages/system-admin-tenant-control-center-page", () => ({
  SystemAdminTenantControlCenterPage: SystemAdminCentralPageMock,
}));

vi.mock("@/pages/system-admin-tenant-provision-page", () => ({
  SystemAdminTenantProvisionPage: () => <RouteDebug label="tenant-provision-page" />,
}));

vi.mock("@/pages/meta-whatsapp-billing-page", () => ({
  MetaWhatsAppBillingSystemAdminPage: () => <RouteDebug label="meta-whatsapp-system-admin-page" />,
  MetaWhatsAppBillingTenantPage: () => <RouteDebug label="meta-whatsapp-tenant-page" />,
}));

vi.mock("@/pages/subscription-plans-page", () => ({
  SubscriptionPlansPage: () => <RouteDebug label="subscription-plans-page" />,
}));

vi.mock("@/pages/customer-subscriptions-page", () => ({
  CustomerSubscriptionsPage: () => <RouteDebug label="customer-subscriptions-page" />,
}));

function renderRouterAt(path: string) {
  window.history.pushState({}, "", path);
  return renderWithProviders(<AppRouter />);
}

describe("AppRouter", () => {
  beforeEach(() => {
    authState.token = null;
    authState.user = null;
    authState.tenant = null;
    authState.isAuthenticated = false;
    authState.isBootstrapping = false;
    authState.error = null;
    authState.logout.mockReset();
    authState.refetchCurrentUser.mockReset();
    getLastCustomerAppTenantSlugMock.mockReset();
    getLastCustomerAppTenantSlugMock.mockReturnValue(null);
    window.history.pushState({}, "", "/");
  });

  test("renderiza a landing em /", () => {
    renderRouterAt("/");

    expect(screen.getByText("landing-page")).toBeInTheDocument();
    expect(screen.getByTestId("route-pathname")).toHaveTextContent("/");
  });

  test("redireciona /c para o ultimo tenant salvo quando existir", async () => {
    getLastCustomerAppTenantSlugMock.mockReturnValue("studio-flow");

    renderRouterAt("/c");

    expect(await screen.findByText("customer-app-home-page")).toBeInTheDocument();
    expect(screen.getByTestId("route-pathname")).toHaveTextContent("/c/studio-flow");
  });

  test("redireciona /app para /login quando nao ha sessao", async () => {
    renderRouterAt("/app");

    expect(await screen.findByText("login-page")).toBeInTheDocument();
    expect(screen.getByTestId("route-pathname")).toHaveTextContent("/login");
  });

  test("redireciona /app para /app/dashboard quando o usuario autenticado nao e professional", async () => {
    authState.token = "token-auth";
    authState.user = {
      id: "user-1",
      name: "Maria Souza",
      email: "maria@agendoro.com",
      role: "ADMIN",
      professionalId: null,
    };
    authState.tenant = {
      id: "tenant-1",
      name: "Agendoro Clinic",
      timezone: "America/Sao_Paulo",
      slug: "clinic",
    };
    authState.isAuthenticated = true;

    renderRouterAt("/app");

    expect(await screen.findByText("dashboard-page")).toBeInTheDocument();
    expect(screen.getByTestId("route-pathname")).toHaveTextContent("/app/dashboard");
  });

  test("redireciona alias internos para a central com search param correto", async () => {
    authState.token = "token-auth";
    authState.user = {
      id: "user-1",
      name: "Maria Souza",
      email: "maria@agendoro.com",
      role: "ADMIN",
      professionalId: null,
    };
    authState.tenant = {
      id: "tenant-1",
      name: "Agendoro Clinic",
      timezone: "America/Sao_Paulo",
      slug: "clinic",
    };
    authState.isAuthenticated = true;

    renderRouterAt("/app/api-tokens");

    expect(await screen.findByText("system-admin-central")).toBeInTheDocument();
    expect(screen.getByTestId("route-tab")).toHaveTextContent("api-tokens");
  });

  test("fallback global redireciona rotas desconhecidas para /", async () => {
    renderRouterAt("/rota-inexistente");

    expect(await screen.findByText("landing-page")).toBeInTheDocument();
    expect(screen.getByTestId("route-pathname")).toHaveTextContent("/");
  });
});
