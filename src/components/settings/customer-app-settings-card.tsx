import { useState } from "react";
import { Button } from "@/components/flow/button";
import { useTenantCustomerAppSettingsQuery } from "@/hooks/use-tenant-customer-app-settings-query";
import { AlertCircle, CheckCircle2, Copy, Loader2 } from "lucide-react";

type CopyState = "idle" | "link-copied" | "message-copied" | "error";

export function CustomerAppSettingsCard() {
  const settingsQuery = useTenantCustomerAppSettingsQuery();
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [copyError, setCopyError] = useState<string | null>(null);

  const handleCopy = async (value: string, successState: Exclude<CopyState, "idle" | "error">) => {
    try {
      setCopyError(null);
      await navigator.clipboard.writeText(value);
      setCopyState(successState);
      window.setTimeout(() => setCopyState("idle"), 2500);
    } catch {
      setCopyState("error");
      setCopyError("Nao foi possivel copiar agora. Tente novamente.");
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-4 backdrop-blur-sm">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-[var(--theme-text-primary)]">App do cliente</h2>
        <p className="text-sm text-text-soft">
          Copie o link do app e a mensagem para orientar seus clientes no WhatsApp Business.
        </p>
      </div>

      {settingsQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-text-soft">
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          Carregando dados do app do cliente...
        </div>
      ) : settingsQuery.isError || !settingsQuery.data ? (
        <div
          className="flex items-center gap-2 rounded-lg border border-[rgba(248,113,113,0.28)] bg-[rgba(239,68,68,0.10)] px-3 py-2 text-sm"
          style={{ color: "#F87171" }}
          role="alert"
        >
          <AlertCircle size={14} aria-hidden="true" />
          {settingsQuery.error instanceof Error
            ? settingsQuery.error.message
            : "Nao foi possivel carregar o link do app agora."}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-soft" htmlFor="customer-app-link">
              Link do app
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="customer-app-link"
                readOnly
                value={settingsQuery.data.customerAppUrl}
                className="min-h-12 w-full rounded-xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-elevated)] px-4 py-3 text-sm text-[var(--theme-text-primary)]"
              />
              <Button
                type="button"
                size="md"
                variant="secondary"
                className="sm:w-auto"
                onClick={() => void handleCopy(settingsQuery.data.customerAppUrl, "link-copied")}
              >
                <Copy size={16} aria-hidden="true" />
                Copiar link
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-soft" htmlFor="customer-app-whatsapp-message">
              Mensagem pronta para WhatsApp Business
            </label>
            <textarea
              id="customer-app-whatsapp-message"
              readOnly
              value={settingsQuery.data.whatsappMessageTemplate}
              className="min-h-40 w-full rounded-xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-elevated)] px-4 py-3 text-sm leading-6 text-[var(--theme-text-primary)]"
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-text-soft">{settingsQuery.data.whatsappBusinessHint}</p>
              <Button
                type="button"
                size="md"
                variant="secondary"
                className="sm:w-auto"
                onClick={() =>
                  void handleCopy(
                    settingsQuery.data.whatsappMessageTemplate,
                    "message-copied",
                  )
                }
              >
                <Copy size={16} aria-hidden="true" />
                Copiar mensagem
              </Button>
            </div>
          </div>

          {copyState !== "idle" && (
            <div
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
              style={
                copyState === "error"
                  ? { color: "#F87171", borderColor: "rgba(248,113,113,0.28)", backgroundColor: "rgba(239,68,68,0.10)" }
                  : { color: "#4ADE80", borderColor: "rgba(34,197,94,0.28)", backgroundColor: "rgba(34,197,94,0.10)" }
              }
              role={copyState === "error" ? "alert" : "status"}
              aria-live="polite"
            >
              {copyState === "error" ? (
                <>
                  <AlertCircle size={14} aria-hidden="true" />
                  {copyError}
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} aria-hidden="true" />
                  {copyState === "link-copied" ? "Link copiado." : "Mensagem copiada."}
                </>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
