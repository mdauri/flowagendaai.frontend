import { AppShell } from "@/components/app/app-shell";
import { useAuth } from "@/hooks/use-auth";
import { Outlet, useNavigate } from "react-router-dom";

export function AppPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  if (!auth.user || !auth.tenant) {
    return null;
  }

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
      <Outlet />
    </AppShell>
  );
}
