import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import { PageState } from "@/components/shared/page-state";
import { usePublicOrderMenuQuery } from "@/hooks/use-order-module";
import { readOrderCart, upsertOrderCartItem, type OrderCartItem } from "@/lib/order-cart";
import { formatOrderCurrency, formatUnitType } from "@/lib/order-formatters";
import { ApiError } from "@/types/api";
import type { Product } from "@/types/order-module";

export function PublicOrderMenuPage() {
  const { slug } = useParams<{ slug: string }>();
  const menuQuery = usePublicOrderMenuQuery(slug);
  const error = menuQuery.error as ApiError | null;
  const [cartItems, setCartItems] = useState<OrderCartItem[]>([]);

  useEffect(() => {
    if (!slug) {
      return;
    }

    setCartItems(readOrderCart(slug));
  }, [slug]);

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [cartItems],
  );

  function getQuantity(productId: string) {
    return cartItems.find((item) => item.productId === productId)?.quantity ?? 0;
  }

  function handleQuantityChange(product: Product, quantityValue: string) {
    if (!slug) {
      return;
    }

    const numericQuantity = Number(quantityValue.replace(",", "."));
    const safeQuantity = Number.isFinite(numericQuantity) ? numericQuantity : 0;
    setCartItems(upsertOrderCartItem(slug, product, safeQuantity));
  }

  if (menuQuery.isLoading) {
    return (
      <PageState
        title="Carregando cardapio"
        description="Estamos preparando os produtos da loja."
      />
    );
  }

  if (error || !menuQuery.data) {
    return (
      <PageState
        title="Cardapio indisponivel"
        description={error?.message ?? "Nao foi possivel carregar o cardapio."}
        actionLabel="Tentar novamente"
        onAction={() => void menuQuery.refetch()}
      />
    );
  }

  const { store, categories } = menuQuery.data;

  return (
    <div className="min-h-screen bg-(--bg-base) px-4 py-6">
      <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-4">
          <Card variant="premium" padding="lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  Cardapio
                </p>
                <h1 className="mt-2 text-3xl font-black text-[var(--theme-text-primary)]">
                  {store.storeName}
                </h1>
                {store.description ? (
                  <p className="mt-2 text-sm text-text-soft">{store.description}</p>
                ) : null}
              </div>
              <div className="flex gap-3">
                <Button as={Link} to={`/${store.slug}`} variant="secondary" size="md">
                  Entrada
                </Button>
                <Button as={Link} to={`/${store.slug}/pedido`} size="md">
                  Fechar pedido
                </Button>
              </div>
            </div>
          </Card>

          {categories.length === 0 ? (
            <PageState
              title="Nenhum produto ativo"
              description="A loja ainda nao publicou itens no cardapio."
            />
          ) : null}

          {categories.map((category) => (
            <Card key={category.id} variant="glass" padding="lg">
              <div className="space-y-2">
                <CardTitle>{category.name}</CardTitle>
                {category.description ? (
                  <CardDescription>{category.description}</CardDescription>
                ) : null}
              </div>

              <div className="mt-5 grid gap-4">
                {category.products.map((product) => (
                  <div
                    key={product.id}
                    className="grid gap-4 rounded-3xl border border-[var(--theme-border-subtle)] bg-black/10 p-4 md:grid-cols-[minmax(0,1fr)_11rem]"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-[var(--theme-text-primary)]">
                          {product.name}
                        </h2>
                        <span className="rounded-full border border-primary/30 px-3 py-1 text-xs font-semibold text-primary">
                          {formatUnitType(product.unitType)}
                        </span>
                      </div>
                      {product.description ? (
                        <p className="text-sm leading-6 text-text-soft">{product.description}</p>
                      ) : null}
                      <div className="flex flex-wrap gap-4 text-sm text-text-soft">
                        <span>{formatOrderCurrency(product.price)}</span>
                        <span>Minimo: {product.minimumQuantity}</span>
                      </div>
                    </div>

                    <div className="grid gap-2 self-start">
                      <label
                        htmlFor={`product-quantity-${product.id}`}
                        className="text-sm font-semibold text-[var(--theme-text-primary)]"
                      >
                        Quantidade
                      </label>
                      <Input
                        id={`product-quantity-${product.id}`}
                        inputSize="sm"
                        type="number"
                        min={0}
                        step="0.001"
                        value={String(getQuantity(product.id))}
                        onChange={(event) => handleQuantityChange(product, event.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <Card variant="glass" padding="lg" className="h-fit lg:sticky lg:top-6">
          <CardTitle>Resumo rapido</CardTitle>
          <div className="mt-4 grid gap-3 text-sm text-text-soft">
            <p>{cartItems.length} item(ns) no carrinho</p>
            <p>
              Total estimado:{" "}
              <span className="font-semibold text-[var(--theme-text-primary)]">
                {formatOrderCurrency(total)}
              </span>
            </p>
          </div>
          <Button as={Link} to={`/${store.slug}/pedido`} className="mt-5 w-full" size="md">
            Continuar pedido
          </Button>
        </Card>
      </div>
    </div>
  );
}
