import { AppShell } from "@/components/app/app-shell";
import { useAuth } from "@/hooks/use-auth";
import { Outlet } from "react-router-dom";

export function AppPage() {
  const auth = useAuth();

  if (!auth.user || !auth.tenant) {
    return null;
  }

  return (
    <AppShell user={auth.user} tenant={auth.tenant} onLogout={auth.logout}>
      <Outlet />
    </AppShell>
  );
}
