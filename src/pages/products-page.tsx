import { useMemo, useState } from "react";
import { Button } from "@/components/flow/button";
import { Checkbox } from "@/components/flow/checkbox";
import { Input } from "@/components/flow/input";
import { SectionHeading } from "@/components/flow/section-heading";
import { Select } from "@/components/flow/select";
import { Textarea } from "@/components/flow/textarea";
import { PageState } from "@/components/shared/page-state";
import {
  useCreateProductMutation,
  useProductCategoriesQuery,
  useProductsQuery,
  useUpdateProductMutation,
} from "@/hooks/use-order-module";
import { formatOrderCurrency, formatUnitType } from "@/lib/order-formatters";
import { ApiError } from "@/types/api";
import type { Product, ProductUnitType } from "@/types/order-module";

const unitOptions: Array<{ value: ProductUnitType; label: string }> = [
  { value: "UNIT", label: "Unidade" },
  { value: "HUNDRED", label: "Cento" },
  { value: "KIT", label: "Kit" },
  { value: "KG", label: "Kg" },
  { value: "TRAY", label: "Bandeja" },
];

export function ProductsPage() {
  const categoriesQuery = useProductCategoriesQuery();
  const productsQuery = useProductsQuery();
  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [unitType, setUnitType] = useState<ProductUnitType>("UNIT");
  const [minimumQuantity, setMinimumQuantity] = useState("1");
  const [sortOrder, setSortOrder] = useState("0");
  const [active, setActive] = useState(true);

  function resetForm() {
    setEditingProduct(null);
    setCategoryId("");
    setName("");
    setDescription("");
    setImageUrl("");
    setPrice("");
    setUnitType("UNIT");
    setMinimumQuantity("1");
    setSortOrder("0");
    setActive(true);
  }

  async function handleSubmit() {
    const payload = {
      categoryId,
      name: name.trim(),
      description: description.trim() || null,
      imageUrl: imageUrl.trim() || null,
      price: Number(price.replace(",", ".")),
      unitType,
      minimumQuantity: Number(minimumQuantity.replace(",", ".")),
      sortOrder: Number(sortOrder || 0),
      active,
    };

    if (editingProduct) {
      await updateMutation.mutateAsync({ id: editingProduct.id, input: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }

    resetForm();
  }

  const errorMessage = useMemo(
    () =>
      ((createMutation.error ?? updateMutation.error ?? productsQuery.error) as ApiError | null)
        ?.message ?? null,
    [createMutation.error, productsQuery.error, updateMutation.error],
  );

  if (categoriesQuery.isLoading || productsQuery.isLoading) {
    return (
      <PageState
        title="Carregando produtos"
        description="Estamos buscando o cardapio administrativo."
      />
    );
  }

  if (categoriesQuery.isError || productsQuery.isError || !categoriesQuery.data || !productsQuery.data) {
    return (
      <PageState
        title="Falha ao carregar produtos"
        description={errorMessage ?? "Nao foi possivel carregar os dados de produtos."}
        actionLabel="Tentar novamente"
        onAction={() => {
          void categoriesQuery.refetch();
          void productsQuery.refetch();
        }}
      />
    );
  }

  const categoryOptions = categoriesQuery.data.categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  return (
    <>
      <SectionHeading eyebrow="Pedidos" title="Produtos" description="Cadastre os itens vendidos por encomenda." />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
        <div className="grid gap-4 rounded-3xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-5">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[var(--theme-text-primary)]">Categoria</label>
            <Select value={categoryId} options={categoryOptions} placeholder="Selecione a categoria" onValueChange={setCategoryId} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[var(--theme-text-primary)]">Nome</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[var(--theme-text-primary)]">Descricao</label>
            <Textarea size="sm" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[var(--theme-text-primary)]">Preco</label>
              <Input type="number" step="0.01" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[var(--theme-text-primary)]">Unidade</label>
              <Select value={unitType} options={unitOptions} onValueChange={(value) => setUnitType(value as ProductUnitType)} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[var(--theme-text-primary)]">Quantidade minima</label>
              <Input type="number" step="0.001" min={0.001} value={minimumQuantity} onChange={(e) => setMinimumQuantity(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[var(--theme-text-primary)]">Ordenacao</label>
              <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[var(--theme-text-primary)]">Image URL</label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Checkbox checked={active} onCheckedChange={setActive} />
            <span className="text-sm font-semibold text-[var(--theme-text-primary)]">Produto ativo</span>
          </div>
          {errorMessage ? (
            <div className="rounded-2xl border border-[rgba(248,113,113,0.28)] bg-[rgba(239,68,68,0.10)] px-4 py-3 text-sm text-[#F87171]">
              {errorMessage}
            </div>
          ) : null}
          <div className="flex gap-3">
            <Button onClick={() => void handleSubmit()} size="md" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingProduct ? "Salvar produto" : "Criar produto"}
            </Button>
            {editingProduct ? (
              <Button onClick={resetForm} variant="secondary" size="md">
                Cancelar
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4">
          {productsQuery.data.products.map((product) => (
            <div key={product.id} className="rounded-3xl border border-[var(--theme-border-subtle)] bg-black/10 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-lg font-bold text-[var(--theme-text-primary)]">{product.name}</p>
                  <p className="mt-1 text-sm text-text-soft">{product.description ?? "Sem descricao"}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-text-soft">
                    <span>{formatOrderCurrency(product.price)}</span>
                    <span>{formatUnitType(product.unitType)}</span>
                    <span>Minimo {product.minimumQuantity}</span>
                    <span>{product.active ? "Ativo" : "Inativo"}</span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditingProduct(product);
                    setCategoryId(product.categoryId);
                    setName(product.name);
                    setDescription(product.description ?? "");
                    setImageUrl(product.imageUrl ?? "");
                    setPrice(String(product.price));
                    setUnitType(product.unitType);
                    setMinimumQuantity(String(product.minimumQuantity));
                    setSortOrder(String(product.sortOrder));
                    setActive(product.active);
                  }}
                >
                  Editar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
