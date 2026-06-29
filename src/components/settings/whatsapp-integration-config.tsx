import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Info, Loader2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/flow/badge";
import { Button } from "@/components/flow/button";
import { Checkbox } from "@/components/flow/checkbox";
import { Input } from "@/components/flow/input";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { PageState } from "@/components/shared/page-state";
import { useToast } from "@/hooks/use-toast";
import { useSaveTenantWhatsappMutation } from "@/hooks/use-save-tenant-whatsapp-mutation";
import { useTenantWhatsappQuery } from "@/hooks/use-tenant-whatsapp-query";
import { ApiError } from "@/types/api";
import type {
  TenantWhatsappIntegration,
  TenantWhatsappStatus,
  TenantWhatsappUpsertInput,
} from "@/types/tenant-whatsapp";
import { cn } from "@/lib/cn";

interface FormState {
  displayName: string;
  displayPhone: string;
  phoneNumberId: string;
  wabaId: string;
  accessToken: string;
  n8nEnabled: boolean;
  isActive: boolean;
}

const emptyFormState: FormState = {
  displayName: "",
  displayPhone: "",
  phoneNumberId: "",
  wabaId: "",
  accessToken: "",
  n8nEnabled: false,
  isActive: true,
};

const statusLabelMap: Record<TenantWhatsappStatus, string> = {
  connected: "Conectado",
  pending: "Pendente",
  inactive: "Inativo",
  error: "Erro",
};

const statusVariantMap: Record<TenantWhatsappStatus, "success" | "warning" | "neutral" | "danger"> = {
  connected: "success",
  pending: "warning",
  inactive: "neutral",
  error: "danger",
};

function normalizePhoneCandidate(value: string): string {
  return value.trim();
}

function isInternationalPhone(value: string): boolean {
  const normalized = normalizePhoneCandidate(value);

  if (!/^\+\d[\d\s()-]*$/.test(normalized)) {
    return false;
  }

  const digits = normalized.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

function isNumericIdentifier(value: string): boolean {
  return /^\d{5,30}$/.test(value.trim());
}

function mapApiError(error: ApiError): string {
  if (error.status === 401) {
    return "Sessao invalida. Faca login novamente.";
  }

  if (error.status === 403) {
    return "Apenas system-admin pode configurar o WhatsApp.";
  }

  if (error.status === 404) {
    return "Ainda nao existe configuracao de WhatsApp para este tenant.";
  }

  if (error.status === 409) {
    return "Este phoneNumberId ja esta em uso em outro tenant.";
  }

  if (error.status === 400) {
    return "Dados invalidos. Revise os campos informados.";
  }

  return "Nao foi possivel concluir a operacao agora.";
}

function mapStatusLabel(status: string): TenantWhatsappStatus {
  const normalized = status.trim().toLowerCase() as TenantWhatsappStatus | string;

  if (normalized === "connected" || normalized === "pending" || normalized === "inactive" || normalized === "error") {
    return normalized;
  }

  if (normalized === "active") {
    return "connected";
  }

  return "pending";
}

function buildFormState(value: TenantWhatsappIntegration): FormState {
  return {
    displayName: value.displayName ?? "",
    displayPhone: value.displayPhone ?? "",
    phoneNumberId: value.phoneNumberId ?? "",
    wabaId: value.wabaId ?? "",
    accessToken: "",
    n8nEnabled: value.n8nEnabled,
    isActive: value.isActive,
  };
}

function buildPayload(
  form: FormState,
  hasExistingConfig: boolean,
  tenantId: string,
): TenantWhatsappUpsertInput {
  const payload: TenantWhatsappUpsertInput = {
    tenantId,
    displayName: form.displayName.trim(),
    displayPhone: form.displayPhone.trim(),
    phoneNumberId: form.phoneNumberId.trim(),
    wabaId: form.wabaId.trim(),
    n8nEnabled: form.n8nEnabled,
    isActive: form.isActive,
  };

  if (form.accessToken.trim()) {
    payload.accessToken = form.accessToken.trim();
  }

  return payload;
}

interface WhatsAppIntegrationConfigProps {
  tenantId: string | null;
  onDirtyChange?: (dirty: boolean) => void;
}

export function WhatsAppIntegrationConfig({ tenantId, onDirtyChange }: WhatsAppIntegrationConfigProps) {
  const { toast } = useToast();
  const whatsappQuery = useTenantWhatsappQuery(tenantId);
  const saveMutation = useSaveTenantWhatsappMutation();
  const [form, setForm] = useState<FormState>(emptyFormState);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const whatsapp = whatsappQuery.data ?? null;
  const isEmptyState = whatsappQuery.error instanceof ApiError && whatsappQuery.error.status === 404;
  const hasExistingConfig = Boolean(whatsapp);
  const status = mapStatusLabel(whatsapp?.status ?? "pending");
  const baselineForm = useMemo(
    () => (whatsapp ? buildFormState(whatsapp) : emptyFormState),
    [whatsapp],
  );
  const isDirty = useMemo(() => {
    if (!tenantId) {
      return false;
    }

    if (isFormVisible && !hasExistingConfig) {
      return (
        form.displayName !== emptyFormState.displayName ||
        form.displayPhone !== emptyFormState.displayPhone ||
        form.phoneNumberId !== emptyFormState.phoneNumberId ||
        form.wabaId !== emptyFormState.wabaId ||
        form.accessToken !== emptyFormState.accessToken ||
        form.n8nEnabled !== emptyFormState.n8nEnabled ||
        form.isActive !== emptyFormState.isActive
      );
    }

    return (
      form.displayName !== baselineForm.displayName ||
      form.displayPhone !== baselineForm.displayPhone ||
      form.phoneNumberId !== baselineForm.phoneNumberId ||
      form.wabaId !== baselineForm.wabaId ||
      form.accessToken.trim().length > 0 ||
      form.n8nEnabled !== baselineForm.n8nEnabled ||
      form.isActive !== baselineForm.isActive
    );
  }, [baselineForm, form, hasExistingConfig, isFormVisible, tenantId]);

  useEffect(() => {
    setForm(emptyFormState);
    setIsFormVisible(false);
    setSaveMessage(null);

    if (!tenantId) {
      return;
    }

    if (whatsapp) {
      setForm(buildFormState(whatsapp));
      setIsFormVisible(true);
    }
  }, [tenantId, whatsapp]);

  useEffect(() => {
    if (!saveMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSaveMessage(null);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [saveMessage]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
    setSaveMessage(null);
  }


  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveMessage(null);

    const validationErrors: string[] = [];

    if (form.displayName.trim().length < 2) {
      validationErrors.push("Informe um nome de exibicao valido.");
    }

    if (!isInternationalPhone(form.displayPhone)) {
      validationErrors.push("Informe o numero WhatsApp em formato internacional.");
    }

    if (!isNumericIdentifier(form.phoneNumberId)) {
      validationErrors.push("Phone Number ID invalido.");
    }

    if (!isNumericIdentifier(form.wabaId)) {
      validationErrors.push("WABA ID invalido.");
    }

    if (!hasExistingConfig && !form.accessToken.trim()) {
      validationErrors.push("Informe o token da Meta para criar a integracao.");
    }

    if (validationErrors.length > 0) {
      toast({
        title: "Revise os campos",
        description: validationErrors[0],
        variant: "warning",
      });
      return;
    }

    try {
      if (!tenantId) {
        return;
      }

      const payload = buildPayload(form, hasExistingConfig, tenantId);
      const response = await saveMutation.mutateAsync(payload);
      setForm(buildFormState(response));
      setIsFormVisible(true);
      setSaveMessage("Configuracao do WhatsApp salva com sucesso.");
      toast({
        title: "WhatsApp salvo",
        description: "A configuracao do tenant foi atualizada.",
        variant: "success",
      });
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        toast({
          title: "Falha ao salvar",
          description: mapApiError(error),
          variant: "danger",
        });
        return;
      }

      toast({
        title: "Falha ao salvar",
        description: "Erro inesperado.",
        variant: "danger",
      });
    }
  }

  if (!tenantId) {
    return (
      <PageState
        title="Selecione um tenant"
        description="Escolha um tenant acima para carregar e configurar o WhatsApp."
      />
    );
  }

  if (whatsappQuery.isLoading) {
    return (
      <div className="space-y-4 rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">WhatsApp</p>
            <h2 className="mt-2 text-2xl font-black text-[var(--theme-text-primary)]">Integração WhatsApp</h2>
          </div>
          <Loader2 size={20} className="animate-spin text-text-soft" />
        </div>
        <p className="text-sm text-text-soft">Carregando configuracao do tenant...</p>
      </div>
    );
  }

  if (whatsappQuery.isError && !isEmptyState) {
    return (
      <FeedbackBanner
        tone="danger"
        title="Nao foi possivel carregar a configuracao do WhatsApp"
        description={
          whatsappQuery.error instanceof ApiError
            ? mapApiError(whatsappQuery.error)
            : "Erro inesperado ao carregar a configuracao."
        }
      />
    );
  }

  if (isEmptyState && !isFormVisible) {
    return (
      <div className="space-y-4 rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-4 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">WhatsApp</p>
            <h2 className="text-2xl font-black text-[var(--theme-text-primary)]">Integração WhatsApp</h2>
            <p className="max-w-2xl text-sm leading-6 text-text-soft">
              Nenhuma configuracao foi criada ainda. Cadastre o numero do tenant para preparar o webhook unico da Meta Cloud API.
            </p>
          </div>
          <Badge variant="warning">Pendente</Badge>
        </div>

        <div className="rounded-2xl border border-[var(--theme-border-subtle)] bg-black/10 p-4">
          <div className="flex items-start gap-3">
            <Info size={18} className="mt-0.5 text-secondary" aria-hidden="true" />
            <div className="space-y-2 text-sm leading-6 text-text-soft">
              <p>Voce vai precisar do Phone Number ID, do WABA ID e do token de acesso da Meta.</p>
              <p>O webhook unico do tenant sera disponibilizado apos a criacao da integracao.</p>
            </div>
          </div>
        </div>

        <Button onClick={() => setIsFormVisible(true)} size="md">
          Configurar WhatsApp
        </Button>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4 rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-4 backdrop-blur-sm">
      <div className="grid gap-4 sm:flex sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">WhatsApp</p>
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black text-[var(--theme-text-primary)]">Integração WhatsApp</h2>
            <Badge variant={statusVariantMap[status]}>{statusLabelMap[status]}</Badge>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-text-soft">
            Cadastre e mantenha os dados da conta WhatsApp do tenant para preparar o webhook unico da Meta e o faturamento futuro por mensagem.
          </p>
        </div>

      </div>

      {saveMessage ? (
        <div
          className="flex items-center gap-2 rounded-lg border border-[rgba(34,197,94,0.28)] bg-[rgba(34,197,94,0.10)] px-3 py-2 text-sm"
          style={{ color: "#4ADE80" }}
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 size={16} aria-hidden="true" />
          {saveMessage}
        </div>
      ) : null}

      {whatsapp?.accessTokenMasked ? (
        <div className="rounded-2xl border border-[var(--theme-border-subtle)] bg-black/10 p-4">
          <p className="text-sm font-semibold text-[var(--theme-text-primary)]">Token salvo</p>
          <p className="mt-2 text-sm text-text-soft">
            {whatsapp.accessTokenMasked}{" "}
            <span className="text-xs text-text-soft">O valor completo nunca e exibido novamente.</span>
          </p>
        </div>
      ) : null}

      <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="display-name" className="block text-sm font-semibold text-[var(--theme-text-primary)]">
              Nome de exibicao
            </label>
            <Input
              id="display-name"
              value={form.displayName}
              onChange={(event) => updateField("displayName", event.target.value)}
              placeholder="Agendoro Test"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="display-phone" className="block text-sm font-semibold text-[var(--theme-text-primary)]">
              Numero WhatsApp
            </label>
            <Input
              id="display-phone"
              value={form.displayPhone}
              onChange={(event) => updateField("displayPhone", event.target.value)}
              placeholder="+55 12 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone-number-id" className="block text-sm font-semibold text-[var(--theme-text-primary)]">
              Phone Number ID
            </label>
            <Input
              id="phone-number-id"
              value={form.phoneNumberId}
              onChange={(event) => updateField("phoneNumberId", event.target.value)}
              placeholder="123456789"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="waba-id" className="block text-sm font-semibold text-[var(--theme-text-primary)]">
              WABA ID
            </label>
            <Input
              id="waba-id"
              value={form.wabaId}
              onChange={(event) => updateField("wabaId", event.target.value)}
              placeholder="987654321"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--theme-border-subtle)] bg-black/10 p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert size={18} className="mt-0.5 text-secondary" aria-hidden="true" />
            <div className="space-y-2 text-sm leading-6 text-text-soft">
              <p>O token da Meta e sensivel. Nao compartilhe este valor.</p>
              <p>Se houver um token salvo, ele sera mantido enquanto este campo permanecer vazio.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="access-token" className="block text-sm font-semibold text-[var(--theme-text-primary)]">
              Token de acesso da Meta
            </label>
            <Input
              id="access-token"
              type="password"
              value={form.accessToken}
              onChange={(event) => updateField("accessToken", event.target.value)}
              placeholder={hasExistingConfig ? "Deixe em branco para manter o token salvo" : "EAAXXXXX"}
              autoComplete="off"
            />
            <p className="text-xs leading-5 text-text-soft">
              {hasExistingConfig
                ? "Preencha apenas se quiser substituir o token salvo."
                : "Obrigatorio para criar a integracao."}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="webhook-verify-token" className="block text-sm font-semibold text-[var(--theme-text-primary)]">
              Webhook verify token
            </label>
            <Input
              id="webhook-verify-token"
              value="Global no webhook da aplicacao"
              readOnly
            />
            <p className="text-xs leading-5 text-text-soft">
              O verify token e global e configurado no ambiente da aplicacao para `GET /webhooks/meta/whatsapp`.
            </p>
          </div>
        </div>

        <details className="rounded-2xl border border-[var(--theme-border-subtle)] bg-black/10 p-4">
          <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--theme-text-primary)]">
            Configuracoes avancadas
          </summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--theme-border-subtle)] bg-black/10 p-4 text-sm text-[var(--theme-text-primary)]">
              <Checkbox
                checked={form.n8nEnabled}
                onCheckedChange={(checked) => updateField("n8nEnabled", checked)}
              />
              Habilitar n8n
            </label>
          </div>
        </details>

        <label className={cn("flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--theme-border-subtle)] bg-black/10 p-4 text-sm text-[var(--theme-text-primary)]")}>
          <Checkbox
            checked={form.isActive}
            onCheckedChange={(checked) => updateField("isActive", checked)}
          />
          Integracao ativa
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="submit"
            disabled={saveMutation.isPending}
            size="md"
            className="w-full sm:w-auto"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                Salvando...
              </>
            ) : hasExistingConfig ? (
              "Salvar integração"
            ) : (
              "Configurar WhatsApp"
            )}
          </Button>

          <p className="text-xs leading-5 text-text-soft">
            Phone Number ID e WABA ID ficam visiveis na Meta Developer Console. O webhook e identificado pelo phoneNumberId.
          </p>
        </div>
      </form>
    </div>
  );
}
