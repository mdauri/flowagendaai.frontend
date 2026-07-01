import { useMemo, useState } from "react";
import { Button } from "@/components/flow/button";
import { Checkbox } from "@/components/flow/checkbox";
import { Input } from "@/components/flow/input";
import { SectionHeading } from "@/components/flow/section-heading";
import { Textarea } from "@/components/flow/textarea";
import { PageState } from "@/components/shared/page-state";
import {
  useCreateProductCategoryMutation,
  useProductCategoriesQuery,
  useUpdateProductCategoryMutation,
} from "@/hooks/use-order-module";
import { ApiError } from "@/types/api";
import type { ProductCategory } from "@/types/order-module";

export function ProductCategoriesPage() {
  const categoriesQuery = useProductCategoriesQuery();
  const createMutation = useCreateProductCategoryMutation();
  const updateMutation = useUpdateProductCategoryMutation();
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [active, setActive] = useState(true);

  function resetForm() {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setSortOrder("0");
    setActive(true);
  }

  async function handleSubmit() {
    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      sortOrder: Number(sortOrder || 0),
      active,
    };

    if (editingCategory) {
      await updateMutation.mutateAsync({ id: editingCategory.id, input: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }

    resetForm();
  }

  const errorMessage = useMemo(
    () =>
      ((createMutation.error ?? updateMutation.error ?? categoriesQuery.error) as ApiError | null)
        ?.message ?? null,
    [categoriesQuery.error, createMutation.error, updateMutation.error],
  );

  if (categoriesQuery.isLoading) {
    return (
      <PageState
        title="Carregando categorias"
        description="Estamos buscando as categorias da loja."
      />
    );
  }

  if (categoriesQuery.isError || !categoriesQuery.data) {
    return (
      <PageState
        title="Falha ao carregar categorias"
        description={errorMessage ?? "Nao foi possivel carregar as categorias."}
        actionLabel="Tentar novamente"
        onAction={() => void categoriesQuery.refetch()}
      />
    );
  }

  return (
    <>
      <SectionHeading eyebrow="Pedidos" title="Categorias" description="Organize o cardapio em grupos." />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="grid gap-4 rounded-3xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-5">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[var(--theme-text-primary)]">Nome</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[var(--theme-text-primary)]">Descricao</label>
            <Textarea size="sm" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[var(--theme-text-primary)]">Ordenacao</label>
            <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Checkbox checked={active} onCheckedChange={setActive} />
            <span className="text-sm font-semibold text-[var(--theme-text-primary)]">Categoria ativa</span>
          </div>
          {errorMessage ? (
            <div className="rounded-2xl border border-[rgba(248,113,113,0.28)] bg-[rgba(239,68,68,0.10)] px-4 py-3 text-sm text-[#F87171]">
              {errorMessage}
            </div>
          ) : null}
          <div className="flex gap-3">
            <Button onClick={() => void handleSubmit()} size="md" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingCategory ? "Salvar categoria" : "Criar categoria"}
            </Button>
            {editingCategory ? (
              <Button onClick={resetForm} variant="secondary" size="md">
                Cancelar
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4">
          {categoriesQuery.data.categories.map((category) => (
            <div key={category.id} className="rounded-3xl border border-[var(--theme-border-subtle)] bg-black/10 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-lg font-bold text-[var(--theme-text-primary)]">{category.name}</p>
                  <p className="mt-1 text-sm text-text-soft">{category.description ?? "Sem descricao"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-primary/30 px-3 py-1 text-xs font-semibold text-primary">
                    {category.active ? "Ativa" : "Inativa"}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditingCategory(category);
                      setName(category.name);
                      setDescription(category.description ?? "");
                      setSortOrder(String(category.sortOrder));
                      setActive(category.active);
                    }}
                  >
                    Editar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
