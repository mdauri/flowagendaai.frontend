import { useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import { Select } from "@/components/flow/select";
import { Textarea } from "@/components/flow/textarea";
import { PageState } from "@/components/shared/page-state";
import {
  useCreatePublicProductOrderMutation,
  usePublicOrderMenuQuery,
  usePublicOrderStoreQuery,
} from "@/hooks/use-order-module";
import {
  clearOrderCart,
  readOrderCart,
  writeOrderCart,
  type OrderCartItem,
} from "@/lib/order-cart";
import { formatOrderCurrency, formatUnitType } from "@/lib/order-formatters";
import { ApiError } from "@/types/api";
import type { FulfillmentType } from "@/types/order-module";

export function PublicOrderCheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const storeQuery = usePublicOrderStoreQuery(slug);
  const menuQuery = usePublicOrderMenuQuery(slug);
  const createOrderMutation = useCreatePublicProductOrderMutation(slug);
  const [cartItems, setCartItems] = useState<OrderCartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [desiredDate, setDesiredDate] = useState(
    DateTime.now().plus({ days: 1 }).toISODate() ?? "",
  );
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>("PICKUP");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!slug) {
      return;
    }

    setCartItems(readOrderCart(slug));
  }, [slug]);

  const totalAmount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [cartItems],
  );

  function handleQuantityChange(productId: string, value: string) {
    if (!slug) {
      return;
    }

    const nextQuantity = Number(value.replace(",", "."));
    const nextItems = cartItems
      .map((item) =>
        item.productId === productId
          ? { ...item, quantity: Number.isFinite(nextQuantity) ? nextQuantity : 0 }
          : item,
      )
      .filter((item) => item.quantity > 0);

    setCartItems(nextItems);
    writeOrderCart(slug, nextItems);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!slug) {
      return;
    }

    const response = await createOrderMutation.mutateAsync({
      customerName,
      customerPhone,
      desiredDate,
      fulfillmentType,
      address: fulfillmentType === "DELIVERY" ? address : null,
      notes: notes.trim() || null,
      items: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    });

    clearOrderCart(slug);
    navigate(`/${slug}/confirmacao/${response.order.orderNumber}`);
  }

  const error = (storeQuery.error ?? menuQuery.error ?? createOrderMutation.error) as ApiError | null;
  const errorMessage = error?.message ?? null;

  if (storeQuery.isLoading || menuQuery.isLoading) {
    return (
      <PageState
        title="Carregando pedido"
        description="Estamos preparando a etapa final do pedido."
      />
    );
  }

  if (error || !storeQuery.data || !menuQuery.data) {
    return (
      <PageState
        title="Nao foi possivel abrir o pedido"
        description={error?.message ?? "Falha ao carregar os dados da loja."}
        actionLabel="Tentar novamente"
        onAction={() => {
          void storeQuery.refetch();
          void menuQuery.refetch();
        }}
      />
    );
  }

  const { store } = storeQuery.data;

  return (
    <div className="min-h-screen bg-(--bg-base) px-4 py-6">
      <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <Card variant="glass" padding="lg">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Pedido por encomenda
            </p>
            <h1 className="text-3xl font-black text-[var(--theme-text-primary)]">
              {store.storeName}
            </h1>
            <CardDescription>
              Revise o carrinho e preencha os dados do cliente.
            </CardDescription>
          </div>

          {cartItems.length === 0 ? (
            <PageState
              title="Carrinho vazio"
              description="Adicione produtos no cardapio antes de finalizar o pedido."
              actionLabel="Voltar ao cardapio"
              onAction={() => navigate(`/${slug}/cardapio`)}
            />
          ) : (
            <form className="mt-6 grid gap-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label
                    className="text-sm font-semibold text-[var(--theme-text-primary)]"
                    htmlFor="customerName"
                  >
                    Nome
                  </label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    className="text-sm font-semibold text-[var(--theme-text-primary)]"
                    htmlFor="customerPhone"
                  >
                    Telefone
                  </label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    className="text-sm font-semibold text-[var(--theme-text-primary)]"
                    htmlFor="desiredDate"
                  >
                    Data desejada
                  </label>
                  <Input
                    id="desiredDate"
                    type="date"
                    min={DateTime.now().toISODate() ?? undefined}
                    value={desiredDate}
                    onChange={(e) => setDesiredDate(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    className="text-sm font-semibold text-[var(--theme-text-primary)]"
                    htmlFor="fulfillmentType"
                  >
                    Recebimento
                  </label>
                  <Select
                    id="fulfillmentType"
                    value={fulfillmentType}
                    options={[
                      { value: "PICKUP", label: "Retirada" },
                      { value: "DELIVERY", label: "Entrega sob consulta" },
                    ]}
                    onValueChange={(value) => setFulfillmentType(value as FulfillmentType)}
                  />
                </div>
              </div>

              {fulfillmentType === "DELIVERY" ? (
                <div className="grid gap-2">
                  <label
                    className="text-sm font-semibold text-[var(--theme-text-primary)]"
                    htmlFor="address"
                  >
                    Endereco
                  </label>
                  <Textarea
                    id="address"
                    size="sm"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
              ) : null}

              <div className="grid gap-2">
                <label
                  className="text-sm font-semibold text-[var(--theme-text-primary)]"
                  htmlFor="notes"
                >
                  Observacoes
                </label>
                <Textarea
                  id="notes"
                  size="sm"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-[rgba(248,113,113,0.28)] bg-[rgba(239,68,68,0.10)] px-4 py-3 text-sm text-[#F87171]">
                  {errorMessage}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  size="md"
                  disabled={createOrderMutation.isPending || cartItems.length === 0}
                >
                  {createOrderMutation.isPending ? "Enviando..." : "Finalizar pedido"}
                </Button>
                <Button as={Link} to={`/${slug}/cardapio`} variant="secondary" size="md">
                  Voltar ao cardapio
                </Button>
              </div>
            </form>
          )}
        </Card>

        <Card variant="glass" padding="lg" className="h-fit">
          <CardTitle>Resumo do pedido</CardTitle>
          <div className="mt-4 grid gap-3">
            {cartItems.map((item) => (
              <div
                key={item.productId}
                className="rounded-2xl border border-[var(--theme-border-subtle)] bg-black/10 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--theme-text-primary)]">
                      {item.productName}
                    </p>
                    <p className="text-xs text-text-soft">
                      {formatUnitType(item.unitType)} • minimo {item.minimumQuantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[var(--theme-text-primary)]">
                    {formatOrderCurrency(item.unitPrice * item.quantity)}
                  </p>
                </div>
                <Input
                  className="mt-3"
                  inputSize="sm"
                  type="number"
                  min={0}
                  step="0.001"
                  value={String(item.quantity)}
                  onChange={(event) => handleQuantityChange(item.productId, event.target.value)}
                />
              </div>
            ))}
            <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
              <p className="text-sm text-text-soft">Total estimado</p>
              <p className="text-xl font-black text-[var(--theme-text-primary)]">
                {formatOrderCurrency(totalAmount)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
