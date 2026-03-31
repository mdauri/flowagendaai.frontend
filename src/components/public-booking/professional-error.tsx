import { useNavigate } from "react-router-dom";
import { PageState } from "@/components/shared/page-state";

export function ProfessionalNotFoundState() {
  const navigate = useNavigate();

  return (
    <PageState
      title="Profissional não encontrado"
      description="O link pode estar incorreto ou o profissional não está mais disponível."
      actionLabel="Voltar para o início"
      onAction={() => navigate("/")}
    />
  );
}

export function ConnectionErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <PageState
      title="Erro de conexão"
      description="Não foi possível carregar os dados. Verifique sua conexão."
      actionLabel="Tentar novamente"
      onAction={onRetry}
    />
  );
}
