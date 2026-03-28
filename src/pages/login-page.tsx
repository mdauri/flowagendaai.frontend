import { Navigate } from "react-router-dom";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { PageState } from "@/components/shared/page-state";
import { useAuth } from "@/hooks/use-auth";

export function LoginPage() {
  const auth = useAuth();

  if (auth.isBootstrapping && auth.token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <PageState
          title="Validando sua sessao"
          description="Estamos verificando se sua autenticacao ainda esta ativa."
        />
      </div>
    );
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}
