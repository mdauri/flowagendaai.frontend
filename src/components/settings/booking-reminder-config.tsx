import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/flow/button";
import { Checkbox } from "@/components/flow/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { useBookingReminderSettingsQuery } from "@/hooks/use-booking-reminder-settings-query";
import { useSaveBookingReminderSettingsMutation } from "@/hooks/use-save-booking-reminder-settings-mutation";

type SaveState = "idle" | "saving" | "success" | "error";

const AVAILABLE_OFFSETS = [
  { value: 24, label: "24 horas antes" },
  { value: 12, label: "12 horas antes" },
  { value: 6, label: "6 horas antes" },
] as const;

function sortOffsets(offsets: number[]) {
  return [...offsets].sort((left, right) => right - left);
}

function toggleOffset(offsets: number[], value: number) {
  if (offsets.includes(value)) {
    return offsets.filter((item) => item !== value);
  }

  return sortOffsets([...offsets, value]);
}

export function BookingReminderConfig() {
  const auth = useAuth();
  const tenantId = auth.tenant?.id ?? null;
  const settingsQuery = useBookingReminderSettingsQuery(tenantId);
  const saveMutation = useSaveBookingReminderSettingsMutation();

  const [enabled, setEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [offsets, setOffsets] = useState<number[]>([24]);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!settingsQuery.data) {
      return;
    }

    setEnabled(settingsQuery.data.enabled);
    setWhatsappEnabled(settingsQuery.data.whatsappEnabled);
    setEmailEnabled(settingsQuery.data.emailEnabled);
    setOffsets(sortOffsets(settingsQuery.data.offsets));
    setSaveState("idle");
    setSaveError(null);
  }, [settingsQuery.data]);

  if (!tenantId) {
    return null;
  }

  const controlsDisabled = settingsQuery.isLoading || saveState === "saving" || !enabled;

  async function handleSave() {
    if (enabled && offsets.length === 0) {
      setSaveState("error");
      setSaveError("Selecione pelo menos um intervalo para ativar os lembretes.");
      return;
    }

    if (enabled && !whatsappEnabled && !emailEnabled) {
      setSaveState("error");
      setSaveError("Selecione pelo menos um canal para ativar os lembretes.");
      return;
    }

    setSaveState("saving");
    setSaveError(null);

    try {
      await saveMutation.mutateAsync({
        enabled,
        whatsappEnabled,
        emailEnabled,
        offsets: sortOffsets(offsets),
      });

      setSaveState("success");
      setTimeout(() => setSaveState("idle"), 3000);
    } catch (error) {
      setSaveState("error");
      setSaveError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel salvar os lembretes agora.",
      );
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-4 backdrop-blur-sm">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-[var(--theme-text-primary)]">
          Lembretes de compromisso
        </h2>
        <p className="text-sm text-text-soft">
          Configure quando seus clientes receberao lembretes antes do horario agendado.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-[var(--theme-border-subtle)] bg-[rgba(255,255,255,0.02)] p-3">
        <Checkbox
          checked={enabled}
          onCheckedChange={setEnabled}
          aria-label="Ativar lembretes de compromisso"
          disabled={settingsQuery.isLoading || saveState === "saving"}
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--theme-text-primary)]">
            Ativar lembretes de compromisso
          </label>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-[var(--theme-border-subtle)] bg-[rgba(255,255,255,0.02)] p-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[var(--theme-text-primary)]">
            Enviar lembrete
          </h3>
        </div>

        <div className="space-y-3">
          {AVAILABLE_OFFSETS.map((offset) => (
            <div key={offset.value} className="flex items-start gap-3">
              <Checkbox
                checked={offsets.includes(offset.value)}
                onCheckedChange={() =>
                  setOffsets((currentOffsets) => toggleOffset(currentOffsets, offset.value))
                }
                disabled={controlsDisabled}
                aria-label={offset.label}
              />
              <label className="block text-sm text-[var(--theme-text-primary)]">
                {offset.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-[var(--theme-border-subtle)] bg-[rgba(255,255,255,0.02)] p-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[var(--theme-text-primary)]">
            Enviar por
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={whatsappEnabled}
              onCheckedChange={setWhatsappEnabled}
              disabled={controlsDisabled}
              aria-label="WhatsApp"
            />
            <label className="block text-sm text-[var(--theme-text-primary)]">
              WhatsApp
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              checked={emailEnabled}
              onCheckedChange={setEmailEnabled}
              disabled={controlsDisabled}
              aria-label="E-mail"
            />
            <div className="space-y-1">
              <label className="block text-sm text-[var(--theme-text-primary)]">
                E-mail
              </label>
              <p className="text-xs text-text-soft">
                O lembrete por e-mail sera enviado apenas quando o cliente tiver e-mail cadastrado.
              </p>
            </div>
          </div>
        </div>
      </div>

      {settingsQuery.isLoading ? (
        <div
          className="flex items-center gap-2 rounded-lg border border-[var(--theme-border-subtle)] bg-[rgba(255,255,255,0.02)] px-3 py-2 text-sm text-text-soft"
          role="status"
          aria-live="polite"
        >
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          Carregando configuracao...
        </div>
      ) : null}

      {settingsQuery.isError ? (
        <div
          className="flex items-center gap-2 rounded-lg border border-[rgba(248,113,113,0.28)] bg-[rgba(239,68,68,0.10)] px-3 py-2 text-sm"
          style={{ color: "#F87171" }}
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle size={16} aria-hidden="true" />
          {settingsQuery.error instanceof Error
            ? settingsQuery.error.message
            : "Nao foi possivel carregar os lembretes agora."}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
        <Button
          onClick={handleSave}
          disabled={settingsQuery.isLoading || saveState === "saving"}
          size="md"
          className="w-full sm:w-auto"
        >
          {saveState === "saving" ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Salvando...
            </>
          ) : (
            "Salvar lembretes"
          )}
        </Button>

        {saveState === "success" ? (
          <div
            className="flex items-center gap-2 rounded-lg border border-[rgba(34,197,94,0.28)] bg-[rgba(34,197,94,0.10)] px-3 py-2 text-sm text-[#4ADE80]"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 size={16} aria-hidden="true" />
            Lembretes salvos com sucesso.
          </div>
        ) : null}

        {saveState === "error" && saveError ? (
          <div
            className="flex items-center gap-2 rounded-lg border border-[rgba(248,113,113,0.28)] bg-[rgba(239,68,68,0.10)] px-3 py-2 text-sm"
            style={{ color: "#F87171" }}
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle size={16} aria-hidden="true" />
            {saveError}
          </div>
        ) : null}
      </div>
    </section>
  );
}
