import { Button } from "@/components/flow/button";

export function OrderHostEntryPage() {
  return (
    <div className="min-h-screen bg-(--bg-base) px-4 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 rounded-[2rem] border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-6 backdrop-blur-sm">
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Agendoro Pedidos
          </p>
          <h1 className="text-3xl font-black text-[var(--theme-text-primary)]">
            Informe o slug da loja no endereco
          </h1>
          <p className="text-sm leading-6 text-text-soft">
            Exemplo:{" "}
            <span className="font-semibold text-[var(--theme-text-primary)]">
              pedido.dauri.com.br/cm-salgados
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button as="a" href="/cm-salgados" size="md">
            Abrir exemplo
          </Button>
          <Button as="a" href="/login" variant="secondary" size="md">
            Entrar no painel
          </Button>
        </div>
      </div>
    </div>
  );
}
