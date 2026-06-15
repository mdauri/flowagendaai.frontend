import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
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
  const [enabled, setEnabled] = useState(false);
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

  async function handleSave() {
    if (!tenant) {
      return;
    }

    const parsedDays = Number(daysAfterLastService);
    const parsedCooldown = Number(cooldownDays);

    if (!Number.isInteger(parsedDays) || parsedDays < 1) {
      setSaveState("error");
      setSaveError("Dias apos o ultimo atendimento deve ser um inteiro positivo.");
      return;
    }

    if (!Number.isInteger(parsedCooldown) || parsedCooldown < 1) {
      setSaveState("error");
      setSaveError("Intervalo minimo entre mensagens deve ser um inteiro positivo.");
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
      });

      setSaveState("success");
      setTimeout(() => setSaveState("idle"), 3000);
      auth.refetchCurrentUser();
    } catch (err) {
      setSaveState("error");
      setSaveError(err instanceof Error ? err.message : "Nao foi possivel salvar a automacao.");
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
    } catch (err) {
      setTestState("error");
      setTestError(err instanceof Error ? err.message : "Nao foi possivel enviar o teste.");
    }
  }

  if (!tenant) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-4 backdrop-blur-sm">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-[var(--theme-text-primary)]">
          Lembrete de retorno automatico
        </h2>
        <p className="text-sm text-text-soft">
          Reativa clientes sem novos agendamentos usando o WhatsApp do tenant.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-[var(--theme-border-subtle)] bg-[rgba(255,255,255,0.02)] p-3">
        <Checkbox
          checked={enabled}
          onCheckedChange={setEnabled}
          aria-label="Ativar lembrete de retorno automático"
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--theme-text-primary)]">
            Ativar lembrete de retorno automatico
          </label>
          <p className="text-sm text-text-soft">
            Desativa ou ativa o envio diário para clientes elegíveis.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="reactivation-days" className="block text-sm font-medium text-text-soft">
            Dias apos o ultimo atendimento
          </label>
          <Input
            id="reactivation-days"
            type="number"
            min={1}
            step={1}
            value={daysAfterLastService}
            onChange={(e) => setDaysAfterLastService(e.target.value)}
            disabled={saveState === "saving"}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="reactivation-cooldown" className="block text-sm font-medium text-text-soft">
            Intervalo minimo entre mensagens
          </label>
          <Input
            id="reactivation-cooldown"
            type="number"
            min={1}
            step={1}
            value={cooldownDays}
            onChange={(e) => setCooldownDays(e.target.value)}
            disabled={saveState === "saving"}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="reactivation-template" className="block text-sm font-medium text-text-soft">
          Nome do template WhatsApp
        </label>
        <Input
          id="reactivation-template"
          type="text"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          disabled={saveState === "saving"}
          placeholder="customer_reactivation_30d"
          maxLength={120}
        />
        <p className="text-xs text-text-soft">
          Use um template aprovado na Meta com link ou botao para o catalogo publico do tenant.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-[var(--theme-border-subtle)] bg-[rgba(255,255,255,0.02)] p-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[var(--theme-text-primary)]">
            Teste de recebimento
          </h3>
          <p className="text-sm text-text-soft">
            Envia uma mensagem real para um numero informado, usando o mesmo template e o mesmo WhatsApp do tenant.
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
              onChange={(e) => setTestCustomerName(e.target.value)}
              disabled={testState === "saving"}
              placeholder="Joao Silva"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="reactivation-test-phone" className="block text-sm font-medium text-text-soft">
              Telefone para receber
            </label>
            <Input
              id="reactivation-test-phone"
              type="tel"
              value={testCustomerPhone}
              onChange={(e) => setTestCustomerPhone(e.target.value)}
              disabled={testState === "saving"}
              placeholder="+55 11 99999-9999"
              maxLength={20}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={handleSendTest}
            disabled={testState === "saving"}
            size="md"
            variant="secondary"
            className="w-full sm:w-auto"
          >
            {testState === "saving" ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                Enviando teste...
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
              <CheckCircle2 size={16} />
              Teste enviado com sucesso.
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

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
        <Button
          onClick={handleSave}
          disabled={saveState === "saving"}
          size="md"
          className="w-full sm:w-auto"
        >
          {saveState === "saving" ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Salvando...
            </>
          ) : (
            "Salvar automacao"
          )}
        </Button>

        {saveState === "success" && (
          <div
            className="flex items-center gap-2 rounded-lg border border-[rgba(34,197,94,0.28)] bg-[rgba(34,197,94,0.10)] px-3 py-2 text-sm text-[#4ADE80]"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 size={16} />
            Automacao salva com sucesso.
          </div>
        )}

        {saveState === "error" && saveError && (
          <div
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
