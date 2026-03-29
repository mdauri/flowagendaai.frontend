import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";

interface SlotSearchActionsProps {
  canSearch: boolean;
  isSearching: boolean;
  onSearch: () => void;
}

export function SlotSearchActions({
  canSearch,
  isSearching,
  onSearch,
}: SlotSearchActionsProps) {
  return (
    <Card variant="glass" padding="lg">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Consulta sob demanda</CardTitle>
          <CardDescription className="mt-3">
            A busca so e liberada quando os tres filtros obrigatorios estiverem preenchidos.
          </CardDescription>
        </div>

        <Button
          type="button"
          size="md"
          onClick={onSearch}
          disabled={!canSearch || isSearching}
          aria-disabled={!canSearch || isSearching}
        >
          {isSearching ? "Buscando horarios..." : "Buscar horarios"}
        </Button>
      </div>
    </Card>
  );
}
