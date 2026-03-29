import { PageState } from "@/components/shared/page-state";

export function SlotsEmptyState() {
  return (
    <PageState
      title="Sem disponibilidade para esta consulta"
      description="Nao ha horarios disponiveis para esta combinacao no momento. Altere profissional, servico ou data e consulte novamente."
    />
  );
}
