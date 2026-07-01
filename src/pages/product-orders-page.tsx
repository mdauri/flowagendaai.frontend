import { useMemo, useState } from "react";
import { Button } from "@/components/flow/button";
import { Input } from "@/components/flow/input";
import { SectionHeading } from "@/components/flow/section-heading";
import { Select } from "@/components/flow/select";
import { Textarea } from "@/components/flow/textarea";
import { PageState } from "@/components/shared/page-state";
import {
  useProductOrderQuery,
  useProductOrdersQuery,
  useRegisterProductOrderManualPaymentMutation,
  useUpdateProductOrderStatusMutation,
} from "@/hooks/use-order-module";
import {
  formatFulfillmentType,
  formatOrderCurrency,
  formatOrderDate,
  formatOrderStatus,
  formatPaymentStatus,
  formatUnitType,
} from "@/lib/order-formatters";
import { ApiError } from "@/types/api";
import type { ProductOrderStatus, ProductPaymentStatus } from "@/types/order-module";

const orderStatusOptions: Array<{ value: ProductOrderStatus; label: string }> = [
  { value: "RECEIVED", label: "Recebido" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "AWAITING_PAYMENT", label: "Aguardando pagamento" },
  { value: "PAID", label: "Pago" },
  { value: "IN_PRODUCTION", label: "Em producao" },
  { value: "READY", label: "Pronto" },
  { value: "DELIVERED", label: "Entregue" },
  { value: "CANCELLED", label: "Cancelado" },
];

const paymentStatusOptions: Array<{ value: ProductPaymentStatus; label: string }> = [
  { value: "PENDING", label: "Pendente" },
  { value: "PARTIALLY_PAID", label: "Parcial" },
  { value: "PAID", label: "Pago" },
];

export function ProductOrdersPage() {
  const [desiredDate, setDesiredDate] = useState("");
  const [status, setStatus] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [nextStatus, setNextStatus] = useState<ProductOrderStatus>("RECEIVED");
  const [nextPaymentStatus, setNextPaymentStatus] = useState<ProductPaymentStatus>("PENDING");
  const [manualAmount, setManualAmount] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  const ordersQuery = useProductOrdersQuery({
    desiredDate: desiredDate || undefined,
    status: (status || undefined) as ProductOrderStatus | undefined,
  });
  const orderDetailQuery = useProductOrderQuery(selectedOrderId || undefined);
  const updateStatusMutation = useUpdateProductOrderStatusMutation();
  const manualPaymentMutation = useRegisterProductOrderManualPaymentMutation();

  const selectedOrder = orderDetailQuery.data?.order ?? null;
  const errorMessage = useMemo(
    () =>
      ((ordersQuery.error ??
        orderDetailQuery.error ??
        updateStatusMutation.error ??
        manualPaymentMutation.error) as ApiError | null)?.message ?? null,
    [manualPaymentMutation.error, orderDetailQuery.error, ordersQuery.error, updateStatusMutation.error],
  );

  async function handleUpdateStatus() {
    if (!selectedOrderId) {
      return;
    }

    await updateStatusMutation.mutateAsync({
      id: selectedOrderId,
      input: {
        status: nextStatus,
        paymentStatus: nextPaymentStatus,
      },
    });
  }

  async function handleRegisterPayment() {
    if (!selectedOrderId) {
      return;
    }

    await manualPaymentMutation.mutateAsync({
      id: selectedOrderId,
      input: {
        amount: Number(manualAmount.replace(",", ".")),
        notes: manualNotes.trim() || null,
      },
    });

    setManualAmount("");
    setManualNotes("");
  }

  if (ordersQuery.isLoading) {
    return (
      <PageState
        title="Carregando pedidos"
        description="Estamos buscando os pedidos da loja."
      />
    );
  }

  if (ordersQuery.isError || !ordersQuery.data) {
    return (
      <PageState
        title="Falha ao carregar pedidos"
        description={errorMessage ?? "Nao foi possivel carregar os pedidos."}
        actionLabel="Tentar novamente"
        onAction={() => void ordersQuery.refetch()}
      />
    );
  }

  return (
    <>
      <SectionHeading
        eyebrow="Pedidos"
        title="Pedidos"
        description="Acompanhe status, pagamento e detalhe de cada encomenda."
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="grid gap-4">
          <div className="grid gap-4 rounded-3xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-5 md:grid-cols-3">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[var(--theme-text-primary)]">Data desejada</label>
              <Input type="date" value={desiredDate} onChange={(e) => setDesiredDate(e.target.value)} />
              {desiredDate ? (
                <p className="text-xs text-text-soft">
                  Data selecionada: {formatOrderDate(desiredDate)}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[var(--theme-text-primary)]">Status</label>
              <Select value={status} options={[{ value: "", label: "Todos" }, ...orderStatusOptions]} onValueChange={setStatus} />
            </div>
            <div className="flex items-end">
              <Button variant="secondary" size="md" onClick={() => void ordersQuery.refetch()}>
                Atualizar
              </Button>
            </div>
          </div>

          {ordersQuery.data.orders.map((order) => (
            <button
              key={order.id}
              type="button"
              onClick={() => {
                setSelectedOrderId(order.id);
                setNextStatus(order.status);
                setNextPaymentStatus(order.paymentStatus);
              }}
              className="grid gap-2 rounded-3xl border border-[var(--theme-border-subtle)] bg-black/10 p-5 text-left"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-lg font-bold text-[var(--theme-text-primary)]">{order.orderNumber}</p>
                  <p className="text-sm text-text-soft">
                    {order.customerName} • {formatOrderDate(order.desiredDate)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[var(--theme-text-primary)]">
                  {formatOrderCurrency(order.totalAmount)}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-text-soft">
                <span>{formatOrderStatus(order.status)}</span>
                <span>{formatPaymentStatus(order.paymentStatus)}</span>
                <span>{formatFulfillmentType(order.fulfillmentType)}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-5">
            {!selectedOrder ? (
              <PageState title="Selecione um pedido" description="Abra um pedido da lista para ver o detalhe." />
            ) : (
              <div className="grid gap-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Detalhe</p>
                  <h2 className="mt-2 text-2xl font-black text-[var(--theme-text-primary)]">{selectedOrder.orderNumber}</h2>
                  <p className="mt-1 text-sm text-text-soft">
                    {selectedOrder.customerName} • {selectedOrder.customerPhone}
                  </p>
                </div>

                <div className="grid gap-2 text-sm text-text-soft">
                  <p>Data desejada: {formatOrderDate(selectedOrder.desiredDate)}</p>
                  <p>Recebimento: {formatFulfillmentType(selectedOrder.fulfillmentType)}</p>
                  <p>Status: {formatOrderStatus(selectedOrder.status)}</p>
                  <p>Pagamento: {formatPaymentStatus(selectedOrder.paymentStatus)}</p>
                  {selectedOrder.address ? <p>Endereco: {selectedOrder.address}</p> : null}
                  {selectedOrder.notes ? <p>Observacoes: {selectedOrder.notes}</p> : null}
                </div>

                <div className="grid gap-2">
                  {(selectedOrder.items ?? []).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-[var(--theme-border-subtle)] bg-black/10 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[var(--theme-text-primary)]">{item.productNameSnapshot}</p>
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

                <div className="grid gap-3 rounded-2xl border border-[var(--theme-border-subtle)] bg-black/10 p-4">
                  <p className="font-semibold text-[var(--theme-text-primary)]">Atualizar status</p>
                  <Select value={nextStatus} options={orderStatusOptions} onValueChange={(value) => setNextStatus(value as ProductOrderStatus)} />
                  <Select value={nextPaymentStatus} options={paymentStatusOptions} onValueChange={(value) => setNextPaymentStatus(value as ProductPaymentStatus)} />
                  <Button onClick={() => void handleUpdateStatus()} size="md" disabled={updateStatusMutation.isPending}>
                    {updateStatusMutation.isPending ? "Salvando..." : "Salvar status"}
                  </Button>
                </div>

                <div className="grid gap-3 rounded-2xl border border-[var(--theme-border-subtle)] bg-black/10 p-4">
                  <p className="font-semibold text-[var(--theme-text-primary)]">Pagamento manual</p>
                  <Input type="number" step="0.01" min={0.01} value={manualAmount} onChange={(e) => setManualAmount(e.target.value)} placeholder="Valor pago" />
                  <Textarea size="sm" value={manualNotes} onChange={(e) => setManualNotes(e.target.value)} placeholder="Observacoes do pagamento" />
                  <Button onClick={() => void handleRegisterPayment()} size="md" disabled={manualPaymentMutation.isPending}>
                    {manualPaymentMutation.isPending ? "Registrando..." : "Registrar pagamento"}
                  </Button>
                </div>

                {(orderDetailQuery.data?.payments.length ?? 0) > 0 ? (
                  <div className="grid gap-2">
                    <p className="font-semibold text-[var(--theme-text-primary)]">Historico de pagamentos</p>
                    {orderDetailQuery.data?.payments.map((payment) => (
                      <div key={payment.id} className="rounded-2xl border border-[var(--theme-border-subtle)] bg-black/10 p-3 text-sm text-text-soft">
                        {formatOrderCurrency(payment.amount)} • {formatPaymentStatus(payment.status)}
                        {payment.notes ? ` • ${payment.notes}` : ""}
                      </div>
                    ))}
                  </div>
                ) : null}

                {selectedOrder.customerPhone ? (
                  <Button
                    as="a"
                    href={`https://wa.me/${selectedOrder.customerPhone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    variant="secondary"
                    size="md"
                  >
                    Chamar no WhatsApp
                  </Button>
                ) : null}
              </div>
            )}
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-[rgba(248,113,113,0.28)] bg-[rgba(239,68,68,0.10)] px-4 py-3 text-sm text-[#F87171]">
              {errorMessage}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
