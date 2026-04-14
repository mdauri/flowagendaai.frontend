import { useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { PageState } from "@/components/shared/page-state";
import { useAuth } from "@/hooks/use-auth";
import { clearStoredToken } from "@/session/session-storage";
import { ApiError } from "@/types/api";

export function LoginPage() {
  const auth = useAuth();
  const hasClearedInvalidTokenRef = useRef(false);

  useEffect(() => {
    if (!auth.token) {
      hasClearedInvalidTokenRef.current = false;
      return;
    }

    const isUnauthorized = auth.error instanceof ApiError && auth.error.status === 401;
    if (isUnauthorized && !hasClearedInvalidTokenRef.current) {
      hasClearedInvalidTokenRef.current = true;
      clearStoredToken();
    }
  }, [auth.token, auth.error]);

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
