import { PageState } from "@/components/shared/page-state";

export function SlotsEmptyState() {
  return (
    <PageState
      title="Nenhum horario encontrado"
      description="Altere os filtros e tente novamente."
    />
  );
}
