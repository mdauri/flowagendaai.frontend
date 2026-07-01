import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/flow/button";
import { Card, CardTitle } from "@/components/flow/card";
import { PageState } from "@/components/shared/page-state";
import { usePublicOrderConfirmationQuery } from "@/hooks/use-order-module";
import {
  formatFulfillmentType,
  formatOrderCurrency,
  formatOrderDate,
  formatOrderStatus,
  formatPaymentStatus,
  formatUnitType,
} from "@/lib/order-formatters";
import { ApiError } from "@/types/api";

export function PublicOrderConfirmationPage() {
  const { slug, orderNumber } = useParams<{ slug: string; orderNumber: string }>();
  const confirmationQuery = usePublicOrderConfirmationQuery(slug, orderNumber);
  const error = confirmationQuery.error as ApiError | null;

  if (confirmationQuery.isLoading) {
    return (
      <PageState
        title="Carregando confirmacao"
        description="Estamos preparando o resumo do pedido."
      />
    );
  }

  if (error || !confirmationQuery.data) {
    return (
      <PageState
        title="Pedido nao encontrado"
        description={error?.message ?? "Nao foi possivel carregar a confirmacao."}
        actionLabel="Tentar novamente"
        onAction={() => void confirmationQuery.refetch()}
      />
    );
  }

  const { order, store, whatsappUrl } = confirmationQuery.data;

  return (
    <div className="min-h-screen bg-(--bg-base) px-4 py-6">
      <div className="mx-auto grid max-w-5xl gap-4">
        <Card variant="premium" padding="lg">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Pedido confirmado
          </p>
          <h1 className="mt-2 text-3xl font-black text-[var(--theme-text-primary)]">
            {order.orderNumber}
          </h1>
          <p className="mt-2 text-sm text-text-soft">
            {store.storeName} recebeu seu pedido. Agora finalize o pagamento
            manual via Pix e, se precisar, envie a mensagem pronta no WhatsApp.
          </p>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <Card variant="glass" padding="lg">
            <CardTitle>Resumo do pedido</CardTitle>
            <div className="mt-4 grid gap-3 text-sm text-text-soft">
              <p>
                <span className="font-semibold text-[var(--theme-text-primary)]">
                  Cliente:
                </span>{" "}
                {order.customerName}
              </p>
              <p>
                <span className="font-semibold text-[var(--theme-text-primary)]">
                  Data:
                </span>{" "}
                {formatOrderDate(order.desiredDate)}
              </p>
              <p>
                <span className="font-semibold text-[var(--theme-text-primary)]">
                  Recebimento:
                </span>{" "}
                {formatFulfillmentType(order.fulfillmentType)}
              </p>
              <p>
                <span className="font-semibold text-[var(--theme-text-primary)]">
                  Status:
                </span>{" "}
                {formatOrderStatus(order.status)}
              </p>
              <p>
                <span className="font-semibold text-[var(--theme-text-primary)]">
                  Pagamento:
                </span>{" "}
                {formatPaymentStatus(order.paymentStatus)}
              </p>
            </div>

            <div className="mt-5 grid gap-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[var(--theme-border-subtle)] bg-black/10 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--theme-text-primary)]">
                        {item.productNameSnapshot}
                      </p>
                      <p className="text-xs text-text-soft">
                        {item.quantity} {formatUnitType(item.unitTypeSnapshot)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[var(--theme-text-primary)]">
                      {formatOrderCurrency(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="glass" padding="lg" className="h-fit">
            <CardTitle>Pix manual</CardTitle>
            <div className="mt-4 grid gap-3 text-sm text-text-soft">
              <p>
                <span className="font-semibold text-[var(--theme-text-primary)]">
                  Total:
                </span>{" "}
                {formatOrderCurrency(order.totalAmount)}
              </p>
              <p>
                <span className="font-semibold text-[var(--theme-text-primary)]">
                  Chave Pix:
                </span>{" "}
                {store.pixKey ?? "Nao configurada"}
              </p>
              <p>
                <span className="font-semibold text-[var(--theme-text-primary)]">
                  Recebedor:
                </span>{" "}
                {store.pixReceiverName ?? "Nao informado"}
              </p>
              <p>
                <span className="font-semibold text-[var(--theme-text-primary)]">
                  Instrucoes:
                </span>{" "}
                {order.fulfillmentType === "DELIVERY"
                  ? (store.deliveryInstructions ?? "Entrega sob consulta.")
                  : (store.pickupInstructions ?? "Combine a retirada com a loja.")}
              </p>
            </div>

            <div className="mt-5 grid gap-3">
              {whatsappUrl ? (
                <Button as="a" href={whatsappUrl} target="_blank" rel="noreferrer" size="md">
                  Abrir WhatsApp
                </Button>
              ) : null}
              <Button as={Link} to={`/${slug}/cardapio`} variant="secondary" size="md">
                Voltar ao cardapio
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
