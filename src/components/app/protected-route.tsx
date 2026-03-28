import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { PageState } from "@/components/shared/page-state";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { ApiError } from "@/types/api";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const auth = useRequireAuth();

  if (auth.isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <PageState
          title="Carregando sua sessao"
          description="Estamos validando seu acesso e preparando o shell autenticado."
        />
      </div>
    );
  }

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  if (auth.error instanceof ApiError && auth.error.status === 403) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl items-center px-6">
        <FeedbackBanner
          title="Acesso nao autorizado"
          description="Seu usuario foi autenticado, mas nao pode acessar esta area."
          tone="warning"
        />
      </div>
    );
  }

  if (auth.error instanceof ApiError && auth.error.status >= 500) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <PageState
          title="Nao foi possivel carregar sua sessao"
          description="Tente novamente em instantes. Se o problema continuar, verifique a API do Agendoro."
          actionLabel="Tentar novamente"
          onAction={() => {
            void auth.refetchCurrentUser();
          }}
        />
      </div>
    );
  }

  if (!auth.isAuthenticated || !auth.user || !auth.tenant) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
