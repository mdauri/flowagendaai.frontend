import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/flow/button";

export type PushState =
  | "unsupported"
  | "idle"
  | "loading"
  | "active"
  | "denied"
  | "error";

interface PushReminderStatusCardProps {
  state: PushState;
  hasSession: boolean;
  error: string | null;
  onEnable: () => void;
  onDisable: () => void;
}

export function PushReminderStatusCard({
  state,
  hasSession,
  error,
  onEnable,
  onDisable,
}: PushReminderStatusCardProps) {
  const blocked = state === "denied";
  const unsupported = state === "unsupported";

  return (
    <section className="rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-elevated)] p-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold text-[var(--theme-text-primary)]">
          {blocked
            ? "Lembretes bloqueados"
            : unsupported
              ? "Lembretes indisponíveis"
              : "Lembretes"}
        </h2>
        {blocked || unsupported ? (
          <BellOff size={18} className="mt-1 text-text-muted" aria-hidden="true" />
        ) : (
          <Bell size={18} className="mt-1 text-primary" aria-hidden="true" />
        )}
      </div>
      <div className="mt-2 flex flex-col gap-3 text-sm leading-6" aria-live="polite">
        {state === "loading" ? (
          <div className="flex items-center gap-2 text-text-soft" role="status">
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            Atualizando lembretes...
          </div>
        ) : null}
        {unsupported ? (
          <p className="text-text-soft">
            Este navegador não suporta lembretes push. Você ainda pode consultar seus
            compromissos por aqui.
          </p>
        ) : null}
        {blocked ? (
          <p className="text-text-soft">
            Os lembretes estão bloqueados neste aparelho. Para receber avisos, libere
            as notificações nas configurações do navegador.
          </p>
        ) : null}
        {state === "active" ? (
          <>
            <p className="font-medium text-[var(--theme-success-text)]">
              Lembretes ativos neste aparelho.
            </p>
            <Button type="button" size="md" variant="ghost" onClick={onDisable}>
              Desativar lembretes
            </Button>
          </>
        ) : null}
        {state === "idle" && !hasSession ? (
          <p className="text-text-soft">
            Ative lembretes depois que este aparelho estiver vinculado a um
            agendamento.
          </p>
        ) : null}
        {state === "idle" && hasSession ? (
          <>
            <p className="text-text-soft">
              Ative lembretes para ser avisado antes do seu horário.
            </p>
            <Button type="button" size="md" variant="secondary" onClick={onEnable}>
              Ativar lembretes
            </Button>
          </>
        ) : null}
        {state === "error" ? (
          <>
            <p className="text-[var(--theme-danger-text)]">
              {error || "Não foi possível atualizar os lembretes neste aparelho."}
            </p>
            {hasSession ? (
              <Button type="button" size="md" variant="secondary" onClick={onEnable}>
                Tentar novamente
              </Button>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
