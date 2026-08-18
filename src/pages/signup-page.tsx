import { Navigate } from "react-router";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { PageState } from "@/components/shared/page-state";
import { useAuth } from "@/hooks/use-auth";

export function SignupPage() {
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
    <AuthShell
      title="Comece seu teste gratis"
      description="Organize sua agenda e veja o Agendoro funcionando no seu negocio."
      benefits={[
        "14 dias gratis.",
        "Sem configurar agenda agora.",
        "Cancele quando quiser.",
      ]}
      hideBenefitsOnMobile
    >
      <SignupForm />
    </AuthShell>
  );
}
