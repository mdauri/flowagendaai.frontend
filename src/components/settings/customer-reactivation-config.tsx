import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Badge } from "@/components/flow/badge";
import { Button } from "@/components/flow/button";
import { Checkbox } from "@/components/flow/checkbox";
import { Input } from "@/components/flow/input";
import { useAuth } from "@/hooks/use-auth";
import { tenantService } from "@/services/tenant-service";

type SaveState = "idle" | "saving" | "success" | "error";

function buildNumberField(value: number | undefined, fallback: number): string {
  return String(value ?? fallback);
}

export function CustomerReactivationConfig() {
  const auth = useAuth();
  const tenant = auth.tenant;
  const daysInputRef = useRef<HTMLInputElement>(null);
  const cooldownInputRef = useRef<HTMLInputElement>(null);
  const templateInputRef = useRef<HTMLInputElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [daysAfterLastService, setDaysAfterLastService] = useState("30");
  const [cooldownDays, setCooldownDays] = useState("30");
  const [templateName, setTemplateName] = useState("");
  const [testCustomerName, setTestCustomerName] = useState("");
  const [testCustomerPhone, setTestCustomerPhone] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [testState, setTestState] = useState<SaveState>("idle");
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenant) {
      return;
    }

    setEnabled(tenant.reactivationEnabled ?? false);
    setPushEnabled(tenant.reactivationPushEnabled ?? false);
    setWhatsappEnabled(tenant.reactivationWhatsappEnabled ?? true);
    setEmailEnabled(tenant.reactivationEmailEnabled ?? false);
    setDaysAfterLastService(buildNumberField(tenant.daysAfterLastService, 30));
    setCooldownDays(buildNumberField(tenant.reactivationCooldownDays, 30));
    setTemplateName(tenant.reactivationTemplateName ?? "");
    setTestCustomerName("");
    setTestCustomerPhone("");
    setSaveState("idle");
    setSaveError(null);
    setTestState("idle");
    setTestError(null);
  }, [tenant]);

  function clearSaveFeedback() {
    if (saveState !== "saving") {
      setSaveState("idle");
      setSaveError(null);
    }
  }

  async function handleSave() {
    if (!tenant) {
      return;
    }

    const parsedDays = Number(daysAfterLastService);
    const parsedCooldown = Number(cooldownDays);

    if (!Number.isInteger(parsedDays) || parsedDays < 1 || parsedDays > 3650) {
      setSaveState("error");
      setSaveError("Informe um número inteiro entre 1 e 3650 para os dias após o atendimento.");
      daysInputRef.current?.focus();
      return;
    }

    if (!Number.isInteger(parsedCooldown) || parsedCooldown < 1 || parsedCooldown > 3650) {
      setSaveState("error");
      setSaveError("Informe um intervalo inteiro entre 1 e 3650.");
      cooldownInputRef.current?.focus();
      return;
    }

    if (enabled && !pushEnabled && !whatsappEnabled && !emailEnabled) {
      setSaveState("error");
      setSaveError("Selecione pelo menos um canal.");
      return;
    }

    if (enabled && whatsappEnabled && !templateName.trim()) {
      setSaveState("error");
      setSaveError("Informe o template do WhatsApp.");
      templateInputRef.current?.focus();
      return;
    }

    setSaveState("saving");
    setSaveError(null);

    try {
      await tenantService.updateTenant({
        reactivationEnabled: enabled,
        daysAfterLastService: parsedDays,
        reactivationCooldownDays: parsedCooldown,
        reactivationTemplateName: templateName.trim() || null,
        reactivationPushEnabled: pushEnabled,
        reactivationWhatsappEnabled: whatsappEnabled,
        reactivationEmailEnabled: emailEnabled,
      });

      setSaveState("success");
      setTimeout(() => setSaveState("idle"), 3000);
      auth.refetchCurrentUser();
    } catch (error) {
      setSaveState("error");
      setSaveError(
        error instanceof Error ? error.message : "Não foi possível salvar. Tente novamente.",
      );
    }
  }

  async function handleSendTest() {
    if (!tenant) {
      return;
    }

    if (!testCustomerName.trim()) {
      setTestState("error");
      setTestError("Informe o nome do cliente para o teste.");
      return;
    }

    if (!testCustomerPhone.trim()) {
      setTestState("error");
      setTestError("Informe o telefone para o teste.");
      return;
    }

    setTestState("saving");
    setTestError(null);

    try {
      await tenantService.sendCustomerReturnReminderTest({
        customerName: testCustomerName.trim(),
        customerPhone: testCustomerPhone.trim(),
      });

      setTestState("success");
      setTimeout(() => setTestState("idle"), 3000);
    } catch (error) {
      setTestState("error");
      setTestError(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar a mensagem de teste.",
      );
    }
  }

  if (!tenant) {
    return null;
  }

  const isSaving = saveState === "saving";
  const detailsDisabled = isSaving || !enabled;

  return (
    <section
      className="space-y-4 rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-4 backdrop-blur-sm"
      aria-busy={isSaving}
    >
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-[var(--theme-text-primary)]">
          Lembrete de retorno automático
        </h2>
        <p className="text-sm text-text-soft">
          Reative clientes que estão há um tempo sem agendar.
        </p>
      </div>

      <div className="flex min-h-11 items-start gap-3 rounded-xl border border-[var(--theme-border-subtle)] bg-[rgba(255,255,255,0.02)] p-3">
        <Checkbox
          id="reactivation-enabled"
          checked={enabled}
          onCheckedChange={(checked) => {
            setEnabled(checked);
            clearSaveFeedback();
          }}
          aria-label="Ativar lembrete de retorno automático"
          disabled={isSaving}
        />
        <div className="space-y-1">
          <label
            htmlFor="reactivation-enabled"
            className="block cursor-pointer text-sm font-medium text-[var(--theme-text-primary)]"
          >
            Ativar automação
          </label>
          <p className="text-sm text-text-soft">
            Envia um lembrete quando o cliente fica sem um novo agendamento.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="reactivation-days" className="block text-sm font-medium text-text-soft">
            Dias após o último atendimento
          </label>
          <Input
            ref={daysInputRef}
            id="reactivation-days"
            type="number"
            inputMode="numeric"
            min={1}
            max={3650}
            step={1}
            value={daysAfterLastService}
            onChange={(event) => {
              setDaysAfterLastService(event.target.value);
              clearSaveFeedback();
            }}
            disabled={detailsDisabled}
            aria-invalid={saveState === "error" && Boolean(saveError)}
            aria-describedby={saveError ? "reactivation-save-feedback" : undefined}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="reactivation-cooldown" className="block text-sm font-medium text-text-soft">
            Intervalo mínimo entre lembretes
          </label>
          <Input
            ref={cooldownInputRef}
            id="reactivation-cooldown"
            type="number"
            inputMode="numeric"
            min={1}
            max={3650}
            step={1}
            value={cooldownDays}
            onChange={(event) => {
              setCooldownDays(event.target.value);
              clearSaveFeedback();
            }}
            disabled={detailsDisabled}
            aria-invalid={saveState === "error" && Boolean(saveError)}
            aria-describedby="reactivation-cooldown-help"
          />
          <p id="reactivation-cooldown-help" className="text-xs text-text-soft">
            Evita enviar novos lembretes em sequência.
          </p>
        </div>
      </div>

      <fieldset
        className="space-y-3 rounded-xl border border-[var(--theme-border-subtle)] bg-[rgba(255,255,255,0.02)] p-4"
        aria-describedby="reactivation-channels-help"
      >
        <legend className="px-1 text-base font-semibold text-[var(--theme-text-primary)]">
          Canais de envio
        </legend>
        <p id="reactivation-channels-help" className="text-sm text-text-soft">
          Usamos o primeiro canal disponível, priorizando os de menor custo.
        </p>

        <div className="space-y-4">
          <div className="flex min-h-11 items-start gap-3">
            <Checkbox
              id="reactivation-push"
              checked={pushEnabled}
              onCheckedChange={(checked) => {
                setPushEnabled(checked);
                clearSaveFeedback();
              }}
              disabled={detailsDisabled}
              aria-label="Ativar canal Push"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <label
                  htmlFor="reactivation-push"
                  className="cursor-pointer text-sm text-[var(--theme-text-primary)]"
                >
                  Push Notification
                </label>
                <Badge variant="info">Recomendado</Badge>
              </div>
              <p className="text-xs text-text-soft">
                Sem custo por mensagem. O cliente precisa permitir notificações no App do Cliente.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex min-h-11 items-start gap-3">
              <Checkbox
                id="reactivation-whatsapp"
                checked={whatsappEnabled}
                onCheckedChange={(checked) => {
                  setWhatsappEnabled(checked);
                  clearSaveFeedback();
                }}
                disabled={detailsDisabled}
                aria-label="Ativar canal WhatsApp"
              />
              <div className="space-y-1">
                <label
                  htmlFor="reactivation-whatsapp"
                  className="block cursor-pointer text-sm text-[var(--theme-text-primary)]"
                >
                  WhatsApp
                </label>
                <p className="text-xs text-text-soft">
                  Usa o template aprovado da sua conta.
                </p>
              </div>
            </div>

            {whatsappEnabled && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="reactivation-template" className="block text-sm font-medium text-text-soft">
                    Nome do template WhatsApp
                  </label>
                  <Input
                    ref={templateInputRef}
                    id="reactivation-template"
                    type="text"
                    value={templateName}
                    onChange={(event) => {
                      setTemplateName(event.target.value);
                      clearSaveFeedback();
                    }}
                    disabled={detailsDisabled}
                    placeholder="customer_reactivation_30d"
                    maxLength={120}
                    aria-invalid={
                      saveState === "error" &&
                      enabled &&
                      whatsappEnabled &&
                      !templateName.trim()
                    }
                    aria-describedby="reactivation-template-help"
                  />
                  <p id="reactivation-template-help" className="text-xs text-text-soft">
                    Informe o nome exato do template aprovado na Meta.
                  </p>
                </div>

                <div className="space-y-4 border-t border-[var(--theme-border-subtle)] pt-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-[var(--theme-text-primary)]">
                      Teste do WhatsApp
                    </h3>
                    <p className="text-sm text-text-soft">
                      Envia uma mensagem real para o número informado.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="reactivation-test-name" className="block text-sm font-medium text-text-soft">
                        Nome do cliente
                      </label>
                      <Input
                        id="reactivation-test-name"
                        type="text"
                        value={testCustomerName}
                        onChange={(event) => setTestCustomerName(event.target.value)}
                        disabled={detailsDisabled || testState === "saving"}
                        placeholder="João Silva"
                        maxLength={200}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="reactivation-test-phone" className="block text-sm font-medium text-text-soft">
                        Telefone
                      </label>
                      <Input
                        id="reactivation-test-phone"
                        type="tel"
                        value={testCustomerPhone}
                        onChange={(event) => setTestCustomerPhone(event.target.value)}
                        disabled={detailsDisabled || testState === "saving"}
                        placeholder="+55 11 99999-9999"
                        maxLength={20}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      onClick={handleSendTest}
                      disabled={detailsDisabled || testState === "saving"}
                      aria-busy={testState === "saving"}
                      size="md"
                      variant="secondary"
                      className="w-full sm:w-auto"
                    >
                      {testState === "saving" ? (
                        <>
                          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                          Enviando...
                        </>
                      ) : (
                        "Enviar teste"
                      )}
                    </Button>

                    {testState === "success" && (
                      <div
                        className="flex items-center gap-2 rounded-lg border border-[rgba(34,197,94,0.28)] bg-[rgba(34,197,94,0.10)] px-3 py-2 text-sm text-[#4ADE80]"
                        role="status"
                        aria-live="polite"
                      >
                        <CheckCircle2 size={16} aria-hidden="true" />
                        Mensagem de teste enviada.
                      </div>
                    )}

                    {testState === "error" && testError && (
                      <div
                        className="flex items-center gap-2 rounded-lg border border-[rgba(248,113,113,0.28)] bg-[rgba(239,68,68,0.10)] px-3 py-2 text-sm"
                        style={{ color: "#F87171" }}
                        role="alert"
                        aria-live="assertive"
                      >
                        <AlertCircle size={16} aria-hidden="true" />
                        {testError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex min-h-11 items-start gap-3">
            <Checkbox
              id="reactivation-email"
              checked={emailEnabled}
              onCheckedChange={(checked) => {
                setEmailEnabled(checked);
                clearSaveFeedback();
              }}
              disabled={detailsDisabled}
              aria-label="Ativar canal E-mail"
            />
            <div className="space-y-1">
              <label
                htmlFor="reactivation-email"
                className="block cursor-pointer text-sm text-[var(--theme-text-primary)]"
              >
                E-mail
              </label>
              <p className="text-xs text-text-soft">
                Usado quando o cliente tem e-mail cadastrado.
              </p>
            </div>
          </div>
        </div>
      </fieldset>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          aria-busy={isSaving}
          size="md"
          className="w-full sm:w-auto"
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Salvando...
            </>
          ) : (
            "Salvar automação"
          )}
        </Button>

        {saveState === "success" && (
          <div
            id="reactivation-save-feedback"
            className="flex items-center gap-2 rounded-lg border border-[rgba(34,197,94,0.28)] bg-[rgba(34,197,94,0.10)] px-3 py-2 text-sm text-[#4ADE80]"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 size={16} aria-hidden="true" />
            Automação salva.
          </div>
        )}

        {saveState === "error" && saveError && (
          <div
            id="reactivation-save-feedback"
            className="flex items-center gap-2 rounded-lg border border-[rgba(248,113,113,0.28)] bg-[rgba(239,68,68,0.10)] px-3 py-2 text-sm"
            style={{ color: "#F87171" }}
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle size={16} aria-hidden="true" />
            {saveError}
          </div>
        )}
      </div>
    </section>
  );
}
