import { Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/flow/button";

export type InstallState = "unavailable" | "available" | "installing";

interface InstallAppCardProps {
  state: InstallState;
  onInstall: () => void;
}

export function InstallAppCard({ state, onInstall }: InstallAppCardProps) {
  return (
    <section className="rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-elevated)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--theme-text-primary)]">
            Instalar neste aparelho
          </h2>
          <p className="mt-1 text-sm leading-6 text-text-soft">
            Instale o app para voltar mais rápido aos seus compromissos.
          </p>
        </div>
        <Smartphone size={18} className="mt-1 text-primary" aria-hidden="true" />
      </div>
      <div className="mt-4" aria-live="polite">
        {state === "available" ? (
          <Button type="button" size="md" variant="secondary" onClick={onInstall}>
            Instalar app
          </Button>
        ) : null}
        {state === "installing" ? (
          <div className="flex items-center gap-2 text-sm text-text-soft" role="status">
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            Abrindo instalação...
          </div>
        ) : null}
        {state === "unavailable" ? (
          <p className="text-sm leading-6 text-text-soft">
            Use o menu Compartilhar ou Instalar do navegador para adicionar o app.
          </p>
        ) : null}
      </div>
    </section>
  );
}
