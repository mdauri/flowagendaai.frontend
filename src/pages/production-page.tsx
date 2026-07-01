import { DateTime } from "luxon";
import { useState } from "react";
import { Button } from "@/components/flow/button";
import { Input } from "@/components/flow/input";
import { SectionHeading } from "@/components/flow/section-heading";
import { PageState } from "@/components/shared/page-state";
import { useProductionSummaryQuery } from "@/hooks/use-order-module";
import { formatOrderDate, formatUnitType } from "@/lib/order-formatters";
import { ApiError } from "@/types/api";

export function ProductionPage() {
  const [desiredDate, setDesiredDate] = useState(
    DateTime.now().plus({ days: 1 }).toISODate() ?? "",
  );
  const summaryQuery = useProductionSummaryQuery(desiredDate);
  const error = summaryQuery.error as ApiError | null;

  return (
    <>
      <SectionHeading
        eyebrow="Pedidos"
        title="Producao"
        description="Consolide a quantidade total por produto em uma data."
      />

      <div className="mt-8 grid gap-6">
        <div className="flex flex-col gap-3 rounded-3xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-5 sm:flex-row sm:items-end">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[var(--theme-text-primary)]">Data</label>
            <Input type="date" value={desiredDate} onChange={(e) => setDesiredDate(e.target.value)} />
            {desiredDate ? (
              <p className="text-xs text-text-soft">
                Data selecionada: {formatOrderDate(desiredDate)}
              </p>
            ) : null}
          </div>
          <Button variant="secondary" size="md" onClick={() => void summaryQuery.refetch()}>
            Atualizar
          </Button>
        </div>

        {summaryQuery.isLoading ? (
          <PageState
            title="Carregando producao"
            description="Estamos consolidando os pedidos da data selecionada."
          />
        ) : null}

        {summaryQuery.isError ? (
          <PageState
            title="Falha ao carregar producao"
            description={error?.message ?? "Nao foi possivel gerar o consolidado."}
            actionLabel="Tentar novamente"
            onAction={() => void summaryQuery.refetch()}
          />
        ) : null}

        {!summaryQuery.isLoading && !summaryQuery.isError && summaryQuery.data ? (
          <div className="grid gap-3">
            {summaryQuery.data.items.length === 0 ? (
              <PageState title="Sem itens para produzir" description="Nao ha pedidos elegiveis nesta data." />
            ) : (
              summaryQuery.data.items.map((item) => (
                <div key={item.productName} className="rounded-3xl border border-[var(--theme-border-subtle)] bg-black/10 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold text-[var(--theme-text-primary)]">{item.productName}</p>
                      <p className="text-sm text-text-soft">{formatUnitType(item.unitType)}</p>
                    </div>
                    <p className="text-2xl font-black text-[var(--theme-text-primary)]">{item.quantity}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}
