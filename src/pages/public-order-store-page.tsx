import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { PageState } from "@/components/shared/page-state";
import { usePublicOrderStoreQuery } from "@/hooks/use-order-module";
import { formatOrderCurrency } from "@/lib/order-formatters";
import { ApiError } from "@/types/api";
import { formatBrazilianPhone } from "@/utils/phone";

export function PublicOrderStorePage() {
  const { slug } = useParams<{ slug: string }>();
  const storeQuery = usePublicOrderStoreQuery(slug);
  const error = storeQuery.error as ApiError | null;

  if (storeQuery.isLoading) {
    return (
      <PageState
        title="Carregando loja"
        description="Estamos preparando a entrada da loja."
      />
    );
  }

  if (error || !storeQuery.data) {
    return (
      <PageState
        title="Loja indisponivel"
        description={error?.message ?? "Nao foi possivel carregar a loja."}
        actionLabel="Tentar novamente"
        onAction={() => void storeQuery.refetch()}
      />
    );
  }

  const { store } = storeQuery.data;

  return (
    <div className="min-h-screen bg-(--bg-base) px-4 py-6">
      <div className="mx-auto grid max-w-5xl gap-4">
        <Card variant="premium" padding="lg" className="overflow-hidden">
          <div className="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
            {store.logoUrl ? (
              <img
                src={store.logoUrl}
                alt={store.storeName}
                className="h-24 w-24 rounded-3xl object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-black/20 text-3xl font-black text-primary">
                {store.storeName.slice(0, 1).toUpperCase()}
              </div>
            )}

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Encomendas
              </p>
              <h1 className="text-3xl font-black text-[var(--theme-text-primary)]">
                {store.storeName}
              </h1>
              {store.description ? (
                <p className="text-sm leading-6 text-text-soft">{store.description}</p>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <Button as={Link} to={`/${store.slug}/cardapio`} size="md">
                  Ver cardapio
                </Button>
                <Button
                  as={Link}
                  to={`/${store.slug}/pedido`}
                  variant="secondary"
                  size="md"
                >
                  Ir para pedido
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card variant="glass" padding="lg">
            <CardTitle>Informacoes da loja</CardTitle>
            <div className="mt-4 grid gap-3 text-sm text-text-soft">
              <p>
                <span className="font-semibold text-[var(--theme-text-primary)]">
                  WhatsApp:
                </span>{" "}
                {store.whatsappPhone
                  ? formatBrazilianPhone(store.whatsappPhone)
                  : "Nao informado"}
              </p>
              <p>
                <span className="font-semibold text-[var(--theme-text-primary)]">
                  Pedido minimo:
                </span>{" "}
                {store.minimumOrderValue != null
                  ? formatOrderCurrency(store.minimumOrderValue)
                  : "Nao definido"}
              </p>
              <p>
                <span className="font-semibold text-[var(--theme-text-primary)]">
                  Antecedencia minima:
                </span>{" "}
                {store.minimumLeadTimeHours != null
                  ? `${store.minimumLeadTimeHours}h`
                  : "Nao definida"}
              </p>
            </div>
          </Card>

          <Card variant="glass" padding="lg">
            <CardTitle>Retirada e entrega</CardTitle>
            <div className="mt-4 grid gap-4 text-sm leading-6 text-text-soft">
              <div>
                <CardDescription>Retirada</CardDescription>
                <p className="mt-2">
                  {store.pickupInstructions ??
                    "Consulte a loja para combinacao de retirada."}
                </p>
              </div>
              <div>
                <CardDescription>Entrega</CardDescription>
                <p className="mt-2">
                  {store.deliveryInstructions ?? "Entrega sob consulta."}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
