import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { useAuth } from "@/hooks/use-auth";
import { CreditCard } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";

function SuspendedAccessPanel() {
  return (
    <Card variant="surface" padding="lg" className="border-red-300/40">
      <div className="grid gap-4">
        <CreditCard className="h-8 w-8 text-red-200" aria-hidden="true" />
        <div>
          <CardTitle>Seu periodo gratuito terminou.</CardTitle>
          <CardDescription className="mt-3">
            Assine o Agendoro por R$ 97/mes para continuar usando sua agenda.
          </CardDescription>
        </div>
        <Button as={NavLink} to="/app/billing" size="md" className="w-full sm:w-fit">
          Assinar Agendoro
        </Button>
      </div>
    </Card>
  );
}

export function AppPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!auth.user || !auth.tenant) {
    return null;
  }

  const entitlement = auth.tenant.entitlement;
  const isBillingRoute = location.pathname.startsWith("/app/billing");
  const shouldBlockOperationalContent = entitlement && !entitlement.canAccess && !isBillingRoute;

  return (
    <AppShell
      user={auth.user}
      tenant={auth.tenant}
      isUserIdentityLoading={auth.isBootstrapping}
      onLogout={() => {
        auth.logout();
        navigate("/login", { replace: true });
      }}
    >
      {shouldBlockOperationalContent ? <SuspendedAccessPanel /> : <Outlet />}
    </AppShell>
  );
}
