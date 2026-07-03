import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, RefreshCcw, ShieldAlert, Unplug, Waypoints } from "lucide-react";
import { Badge } from "@/components/flow/badge";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { PageState } from "@/components/shared/page-state";
import {
  useConnectSystemAdminMetaWhatsappMutation,
  useDisconnectSystemAdminMetaWhatsappMutation,
  useSendSystemAdminMetaWhatsappTestMessageMutation,
  useSyncSystemAdminMetaWhatsappMutation,
  useSystemAdminMetaWhatsappStatusQuery,
} from "@/hooks/use-system-admin-meta-whatsapp";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/types/api";
import type {
  ConnectSystemAdminTenantMetaWhatsappInput,
  SystemAdminTenantMetaWhatsappStatus,
} from "@/types/system-admin";

declare global {
  interface Window {
    FB?: {
      init?: (options: Record<string, unknown>) => void;
      login: (
        callback: (response: Record<string, unknown>) => void,
        options: Record<string, unknown>,
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

interface EmbeddedSignupContext {
  phoneNumberId?: string;
  wabaId?: string;
  businessId?: string;
}

interface MetaWhatsappErrorDetails {
  stage?: string;
  operatorHint?: string;
}

interface WhatsAppIntegrationConfigProps {
  tenantId: string | null;
  onDirtyChange?: (dirty: boolean) => void;
}

const statusLabelMap: Record<SystemAdminTenantMetaWhatsappStatus, string> = {
  not_configured: "Nao configurado",
  connecting: "Conectando",
  active: "Ativo",
  error: "Erro",
  disconnected: "Desconectado",
};

const statusVariantMap: Record<SystemAdminTenantMetaWhatsappStatus, "warning" | "success" | "danger" | "neutral"> = {
  not_configured: "warning",
  connecting: "warning",
  active: "success",
  error: "danger",
  disconnected: "neutral",
};

let metaSdkPromise: Promise<void> | null = null;

function getMetaAppId(): string {
  return (
    import.meta.env.VITE_META_APP_ID ??
    import.meta.env.NEXT_PUBLIC_META_APP_ID ??
    ""
  );
}

function getMetaConfigurationId(): string {
  return (
    import.meta.env.VITE_META_WHATSAPP_CONFIGURATION_ID ??
    import.meta.env.NEXT_PUBLIC_META_WHATSAPP_CONFIGURATION_ID ??
    ""
  );
}

function extractStringRecord(data: unknown): Record<string, unknown> | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }

  return data as Record<string, unknown>;
}

function resolveEmbeddedSignupContext(data: unknown): EmbeddedSignupContext | null {
  const root = extractStringRecord(data);
  if (!root) {
    return null;
  }

  const candidates = [root, extractStringRecord(root.data), extractStringRecord(root.payload)].filter(
    Boolean,
  ) as Array<Record<string, unknown>>;

  for (const candidate of candidates) {
    const phoneNumberId =
      typeof candidate.phoneNumberId === "string"
        ? candidate.phoneNumberId
        : typeof candidate.phone_number_id === "string"
          ? candidate.phone_number_id
          : undefined;
    const wabaId =
      typeof candidate.wabaId === "string"
        ? candidate.wabaId
        : typeof candidate.waba_id === "string"
          ? candidate.waba_id
          : undefined;
    const businessId =
      typeof candidate.businessId === "string"
        ? candidate.businessId
        : typeof candidate.business_id === "string"
          ? candidate.business_id
          : undefined;

    if (phoneNumberId || wabaId || businessId) {
      return { phoneNumberId, wabaId, businessId };
    }
  }

  return null;
}

function mapApiError(error: ApiError): string {
  const details =
    typeof error.details === "object" && error.details !== null
      ? (error.details as MetaWhatsappErrorDetails)
      : null;
  const requestIdSuffix =
    error.requestId && error.requestId !== "unknown"
      ? ` RequestId: ${error.requestId}.`
      : "";

  if (details?.operatorHint) {
    const stagePrefix = details.stage ? `Falha na etapa ${details.stage}. ` : "";
    return `${stagePrefix}${error.message} ${details.operatorHint}${requestIdSuffix}`;
  }

  if (error.status === 401) {
    return "Sessao invalida. Faca login novamente.";
  }

  if (error.status === 403) {
    return "Apenas system-admin pode operar a integracao WhatsApp.";
  }

  if (error.status === 404) {
    return "A integracao WhatsApp deste tenant ainda nao foi configurada.";
  }

  if (error.status === 409) {
    return "Este numero ja esta vinculado a outro tenant.";
  }

  if (error.status === 400) {
    return `${error.message}${requestIdSuffix}`;
  }

  return "Nao foi possivel concluir a operacao agora.";
}

function ensureMetaSdkLoaded(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("SDK indisponivel fora do navegador."));
  }

  if (window.FB?.login) {
    return Promise.resolve();
  }

  if (metaSdkPromise) {
    return metaSdkPromise;
  }

  metaSdkPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Nao foi possivel carregar o Facebook SDK."));
    window.fbAsyncInit = () => {
      window.FB?.init?.({
        appId: getMetaAppId(),
        xfbml: false,
        version: "v24.0",
      });
      resolve();
    };
    document.body.appendChild(script);
  });

  return metaSdkPromise;
}

function buildConnectPayload(
  code: string,
  embeddedSignupContext: EmbeddedSignupContext | null,
  loginResponse: Record<string, unknown>,
): ConnectSystemAdminTenantMetaWhatsappInput {
  const loginContext = resolveEmbeddedSignupContext(loginResponse);

  return {
    code,
    phoneNumberId: embeddedSignupContext?.phoneNumberId ?? loginContext?.phoneNumberId,
    wabaId: embeddedSignupContext?.wabaId ?? loginContext?.wabaId,
    businessId: embeddedSignupContext?.businessId ?? loginContext?.businessId,
  };
}

async function requestEmbeddedSignupCode(): Promise<Record<string, unknown>> {
  await ensureMetaSdkLoaded();

  return new Promise((resolve, reject) => {
    if (!window.FB?.login) {
      reject(new Error("Facebook SDK nao esta disponivel."));
      return;
    }

    window.FB.login(
      (response) => {
        const objectResponse = extractStringRecord(response);
        if (!objectResponse) {
          reject(new Error("Resposta invalida do Embedded Signup."));
          return;
        }

        resolve(objectResponse);
      },
      {
        config_id: getMetaConfigurationId(),
        response_type: "code",
        override_default_response_type: true,
      },
    );
  });
}

function extractCodeFromLoginResponse(response: Record<string, unknown>): string | null {
  const directCode = typeof response.code === "string" ? response.code : null;
  if (directCode?.trim()) {
    return directCode.trim();
  }

  const authResponse = extractStringRecord(response.authResponse);
  const authCode = typeof authResponse?.code === "string" ? authResponse.code : null;
  return authCode?.trim() ? authCode.trim() : null;
}

export function WhatsAppIntegrationConfig({ tenantId, onDirtyChange }: WhatsAppIntegrationConfigProps) {
  const { toast } = useToast();
  const statusQuery = useSystemAdminMetaWhatsappStatusQuery(tenantId);
  const connectMutation = useConnectSystemAdminMetaWhatsappMutation(tenantId);
  const syncMutation = useSyncSystemAdminMetaWhatsappMutation(tenantId);
  const testMessageMutation = useSendSystemAdminMetaWhatsappTestMessageMutation(tenantId);
  const disconnectMutation = useDisconnectSystemAdminMetaWhatsappMutation(tenantId);
  const [testPhone, setTestPhone] = useState("");
  const [embeddedSignupContext, setEmbeddedSignupContext] = useState<EmbeddedSignupContext | null>(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const status = statusQuery.data?.status ?? "not_configured";
  const isBusy =
    connectMutation.isPending ||
    syncMutation.isPending ||
    testMessageMutation.isPending ||
    disconnectMutation.isPending;

  const missingMetaPublicConfig = !getMetaAppId().trim() || !getMetaConfigurationId().trim();

  useEffect(() => {
    onDirtyChange?.(false);
  }, [onDirtyChange]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const nextContext = resolveEmbeddedSignupContext(event.data);
      if (nextContext) {
        setEmbeddedSignupContext(nextContext);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const summaryRows = useMemo(
    () => [
      { label: "Nome verificado", value: statusQuery.data?.verifiedName ?? "Aguardando conexao" },
      { label: "Numero exibido", value: statusQuery.data?.displayPhoneNumber ?? "Aguardando conexao" },
      { label: "WABA ID", value: statusQuery.data?.wabaId ?? "Nao informado" },
      { label: "Phone Number ID", value: statusQuery.data?.phoneNumberId ?? "Nao informado" },
      { label: "Business ID", value: statusQuery.data?.businessId ?? "Nao informado" },
    ],
    [statusQuery.data],
  );

  async function handleConnect() {
    if (!tenantId) {
      return;
    }

    if (missingMetaPublicConfig) {
      toast({
        title: "Configuracao incompleta",
        description: "Defina as variaveis publicas da Meta no frontend para iniciar o Embedded Signup.",
        variant: "warning",
      });
      return;
    }

    try {
      const loginResponse = await requestEmbeddedSignupCode();
      const code = extractCodeFromLoginResponse(loginResponse);

      if (!code) {
        throw new Error("A Meta nao retornou o code da autorizacao.");
      }

      await connectMutation.mutateAsync(buildConnectPayload(code, embeddedSignupContext, loginResponse));
      toast({
        title: "WhatsApp conectado",
        description: "A integracao Meta do tenant foi vinculada com sucesso.",
        variant: "success",
      });
    } catch (error) {
      const description =
        error instanceof ApiError
          ? mapApiError(error)
          : error instanceof Error
            ? error.message
            : "Falha ao iniciar a conexao com a Meta.";
      toast({
        title: "Falha ao conectar",
        description,
        variant: "danger",
      });
    }
  }

  async function handleSync() {
    try {
      await syncMutation.mutateAsync();
      toast({
        title: "Integracao sincronizada",
        description: "Os dados do numero foram atualizados com a Meta.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Falha ao sincronizar",
        description: error instanceof ApiError ? mapApiError(error) : "Erro inesperado.",
        variant: "danger",
      });
    }
  }

  async function handleSendTestMessage() {
    if (!testPhone.trim()) {
      toast({
        title: "Numero obrigatorio",
        description: "Informe um telefone em formato internacional para enviar o teste.",
        variant: "warning",
      });
      return;
    }

    try {
      await testMessageMutation.mutateAsync({ toPhone: testPhone.trim() });
      toast({
        title: "Teste enviado",
        description: "A mensagem de teste foi enviada pela integracao do tenant.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Falha ao enviar teste",
        description: error instanceof ApiError ? mapApiError(error) : "Erro inesperado.",
        variant: "danger",
      });
    }
  }

  async function handleDisconnect() {
    try {
      await disconnectMutation.mutateAsync();
      setShowDisconnectConfirm(false);
      setTestPhone("");
      toast({
        title: "Integracao desconectada",
        description: "O token salvo foi removido e o tenant ficou desconectado da Meta.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Falha ao desconectar",
        description: error instanceof ApiError ? mapApiError(error) : "Erro inesperado.",
        variant: "danger",
      });
    }
  }

  if (!tenantId) {
    return (
      <PageState
        title="Selecione um tenant"
        description="Escolha um tenant acima para carregar e operar a integracao WhatsApp."
      />
    );
  }

  if (statusQuery.isLoading) {
    return (
      <div className="flex items-center gap-3 text-text-soft">
        <Loader2 size={18} className="animate-spin" />
        Carregando integracao WhatsApp...
      </div>
    );
  }

  if (statusQuery.isError) {
    return (
      <FeedbackBanner
        tone="danger"
        title="Nao foi possivel carregar a integracao"
        description={
          statusQuery.error instanceof ApiError
            ? mapApiError(statusQuery.error)
            : "Erro inesperado ao carregar a integracao WhatsApp."
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {missingMetaPublicConfig ? (
        <FeedbackBanner
          tone="warning"
          title="Variaveis publicas da Meta ausentes"
          description="Configure VITE_META_APP_ID e VITE_META_WHATSAPP_CONFIGURATION_ID para habilitar o Embedded Signup nesta tela."
        />
      ) : null}

      {statusQuery.data?.lastError ? (
        <FeedbackBanner
          tone="danger"
          title="Ultimo erro registrado"
          description={statusQuery.data.lastError}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <Card variant="glass" padding="lg" className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
                WhatsApp Business
              </p>
              <CardTitle className="mt-2">Embedded Signup da Meta</CardTitle>
              <CardDescription className="mt-2">
                Conecte a conta WhatsApp Business do tenant sem expor token no frontend.
              </CardDescription>
            </div>
            <Badge variant={statusVariantMap[status]}>{statusLabelMap[status]}</Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {summaryRows.map((row) => (
              <div
                key={row.label}
                className="rounded-2xl border border-[var(--theme-border-subtle)] bg-black/10 p-4"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-text-soft">{row.label}</p>
                <p className="mt-2 break-all text-sm font-semibold text-[var(--theme-text-primary)]">
                  {row.value}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[var(--theme-border-subtle)] bg-black/10 p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert size={18} className="mt-0.5 text-secondary" />
              <div className="space-y-1 text-sm leading-6 text-text-soft">
                <p>O token Meta e trocado e armazenado apenas no backend do Agendoro.</p>
                <p>O webhook unico continua ativo e a resolucao do tenant segue pelo Phone Number ID.</p>
              </div>
            </div>
          </div>
        </Card>

        <Card variant="premium" padding="lg" className="space-y-4">
          <CardTitle>Acoes</CardTitle>
          <CardDescription>
            Conecte, sincronize, envie um teste e desconecte a integracao do tenant.
          </CardDescription>

          <Button
            type="button"
            size="md"
            onClick={() => void handleConnect()}
            disabled={isBusy}
            className="w-full"
          >
            {connectMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <Waypoints size={16} />
                {status === "active" ? "Conectar novamente" : "Conectar WhatsApp Business"}
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => void handleSync()}
            disabled={isBusy || !statusQuery.data?.configured}
            className="w-full"
          >
            {syncMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCcw size={16} />
                Sincronizar
              </>
            )}
          </Button>

          <div className="space-y-3 rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-4">
            <label className="grid gap-2 text-sm font-semibold text-[var(--theme-text-primary)]">
              Telefone para teste
              <Input
                value={testPhone}
                onChange={(event) => setTestPhone(event.target.value)}
                placeholder="+55 11 99999-9999"
                disabled={isBusy || !statusQuery.data?.configured}
              />
            </label>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => void handleSendTestMessage()}
              disabled={isBusy || !statusQuery.data?.configured}
              className="w-full"
            >
              {testMessageMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Enviando teste...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Enviar teste
                </>
              )}
            </Button>
          </div>

          <Button
            type="button"
            variant="danger"
            size="md"
            onClick={() => setShowDisconnectConfirm(true)}
            disabled={isBusy || !statusQuery.data?.configured}
            className="w-full"
          >
            <Unplug size={16} />
            Desconectar
          </Button>
        </Card>
      </div>

      {showDisconnectConfirm ? (
        <Card
          variant="glass"
          padding="lg"
          radiusSize="lg"
          role="dialog"
          aria-modal="true"
          className="space-y-4 border border-[var(--theme-border-default)]"
        >
          <CardTitle>Desconectar integracao?</CardTitle>
          <CardDescription>
            Essa acao remove o token salvo e desativa o envio do WhatsApp para este tenant ate uma nova conexao.
          </CardDescription>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setShowDisconnectConfirm(false)}
              disabled={disconnectMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={() => void handleDisconnect()}
              disabled={disconnectMutation.isPending}
            >
              {disconnectMutation.isPending ? "Desconectando..." : "Confirmar desconexao"}
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
