import { useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import { Select, type SelectOption } from "@/components/flow/select";
import { PageState } from "@/components/shared/page-state";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { SectionHeading } from "@/components/flow/section-heading";
import { SystemAdminGate } from "@/components/system-admin/system-admin-gate";
import { ProvisionResultCard } from "@/components/system-admin/provision-result-card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useProvisionTenantMutation } from "@/hooks/use-provision-tenant-mutation";
import { ApiError } from "@/types/api";
import type { ProvisionTenantInput, ProvisionTenantResponse } from "@/types/system-admin";

const timezoneOptions: SelectOption[] = [
  { value: "America/Sao_Paulo", label: "America/Sao_Paulo" },
  { value: "America/Fortaleza", label: "America/Fortaleza" },
  { value: "America/Manaus", label: "America/Manaus" },
  { value: "America/Recife", label: "America/Recife" },
  { value: "America/Rio_Branco", label: "America/Rio_Branco" },
  { value: "UTC", label: "UTC" },
];

interface FormValues {
  tenantName: string;
  tenantSlug: string;
  tenantTimezone: string;
  adminName: string;
  adminEmail: string;
}

interface FormErrors {
  tenantName?: string;
  tenantSlug?: string;
  tenantTimezone?: string;
  adminName?: string;
  adminEmail?: string;
}

const emptyFormValues: FormValues = {
  tenantName: "",
  tenantSlug: "",
  tenantTimezone: "America/Sao_Paulo",
  adminName: "",
  adminEmail: "",
};

function normalizeSlug(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (values.tenantName.trim().length < 2) {
    errors.tenantName = "Informe o nome do mandante com pelo menos 2 caracteres.";
  }

  if (!/^[a-z0-9-]{3,80}$/.test(values.tenantSlug)) {
    errors.tenantSlug = "Slug invalido. Use apenas minusculas, numeros e hifen.";
  }

  if (!values.tenantTimezone) {
    errors.tenantTimezone = "Selecione um timezone.";
  }

  if (values.adminName.trim().length < 2) {
    errors.adminName = "Informe o nome do administrador com pelo menos 2 caracteres.";
  }

  if (!/^\S+@\S+\.\S+$/.test(values.adminEmail.trim())) {
    errors.adminEmail = "Email invalido.";
  }

  return errors;
}

function mapApiErrorToMessage(error: ApiError): { message: string; fieldErrors?: FormErrors } {
  if (error.status === 403 || error.code === "FORBIDDEN") {
    return {
      message: "Voce nao tem permissao para provisionar mandantes.",
    };
  }

  if (error.status === 409 || error.code === "CONFLICT_DUPLICATE_TENANT_OR_EMAIL") {
    const lowerMessage = error.message.toLowerCase();

    if (lowerMessage.includes("identificador") || lowerMessage.includes("mandante")) {
      return {
        message: "Ja existe um mandante com este identificador.",
        fieldErrors: {
          tenantSlug: "Ja existe um mandante com este identificador.",
        },
      };
    }

    if (lowerMessage.includes("email")) {
      return {
        message: "Ja existe usuario com este email.",
        fieldErrors: {
          adminEmail: "Ja existe usuario com este email.",
        },
      };
    }

    return {
      message: "Slug do mandante ou email do administrador ja em uso.",
    };
  }

  if (error.status === 400 || error.code === "INVALID_INPUT" || error.code === "VALIDATION_ERROR") {
    return {
      message: "Dados invalidos. Revise os campos obrigatorios.",
    };
  }

  return {
    message: "Nao foi possivel concluir agora. Tente novamente.",
  };
}

export function SystemAdminTenantProvisionPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const provisionMutation = useProvisionTenantMutation();
  const [values, setValues] = useState<FormValues>(emptyFormValues);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [result, setResult] = useState<ProvisionTenantResponse | null>(null);
  const firstErrorFieldRef = useRef<HTMLInputElement | null>(null);

  const isAllowed = useMemo(() => auth.user?.role === "system-admin", [auth.user?.role]);

  function updateValue<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [key]: undefined,
    }));

    setGlobalError(null);
  }

  function getFirstFieldError(errors: FormErrors): keyof FormValues | null {
    const orderedKeys: Array<keyof FormValues> = [
      "tenantName",
      "tenantSlug",
      "tenantTimezone",
      "adminName",
      "adminEmail",
    ];

    return orderedKeys.find((key) => Boolean(errors[key])) ?? null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateForm(values);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setGlobalError("Existem campos invalidos. Revise o formulario.");

      const firstErrorField = getFirstFieldError(validationErrors);
      if (firstErrorField === "tenantName" || firstErrorField === "tenantSlug" || firstErrorField === "adminName" || firstErrorField === "adminEmail") {
        firstErrorFieldRef.current?.focus();
      }

      return;
    }

    const payload: ProvisionTenantInput = {
      tenant: {
        name: values.tenantName.trim(),
        slug: values.tenantSlug.trim().toLowerCase(),
        timezone: values.tenantTimezone,
      },
      adminUser: {
        name: values.adminName.trim(),
        email: values.adminEmail.trim().toLowerCase(),
      },
    };

    try {
      const response = await provisionMutation.mutateAsync(payload);
      setResult(response);
      setGlobalError(null);
      setFieldErrors({});
      toast({
        title: "Mandante provisionado",
        description: `Tenant ${response.tenant.name} criado com sucesso.`,
        variant: "success",
      });
    } catch (error) {
      if (error instanceof ApiError) {
        const mapped = mapApiErrorToMessage(error);
        setGlobalError(mapped.message);

        if (mapped.fieldErrors) {
          setFieldErrors((current) => ({
            ...current,
            ...mapped.fieldErrors,
          }));
        }

        return;
      }

      setGlobalError("Nao foi possivel concluir agora. Tente novamente.");
    }
  }

  function handleCreateAnother() {
    setValues(emptyFormValues);
    setFieldErrors({});
    setGlobalError(null);
    setResult(null);
  }

  if (auth.isBootstrapping) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-white/55" />
      </div>
    );
  }

  return (
    <SystemAdminGate isAllowed={isAllowed}>
      <SectionHeading
        eyebrow="System Admin"
        title="Provisionar novo mandante"
        description="Crie tenant e usuario administrativo inicial em uma operacao unica e auditavel."
      />

      <div className="mt-8 grid gap-6">
        <Card variant="premium" padding="lg">
          <CardTitle>Acao sensivel</CardTitle>
          <CardDescription className="mt-3">
            Este fluxo cria um novo tenant e um usuario administrativo inicial. Revise os dados antes de confirmar.
          </CardDescription>
        </Card>

        {globalError ? (
          <FeedbackBanner title="Falha no provisionamento" description={globalError} tone="danger" />
        ) : null}

        {result ? (
          <ProvisionResultCard
            tenantId={result.tenant.id}
            tenantName={result.tenant.name}
            adminUserId={result.adminUser.id}
            adminEmail={result.adminUser.email}
            createdAtUtc={result.createdAt}
            onCreateAnother={handleCreateAnother}
          />
        ) : (
          <PageState
            title="Nenhum provisionamento executado nesta sessao"
            description="Preencha os dados abaixo e confirme para criar um novo mandante com admin inicial."
          />
        )}

        <Card variant="glass" padding="lg">
          <form onSubmit={handleSubmit} className="grid gap-6" noValidate>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="tenant-name" className="text-sm font-semibold text-white">
                  Nome do mandante
                </label>
                <Input
                  id="tenant-name"
                  ref={fieldErrors.tenantName ? firstErrorFieldRef : undefined}
                  value={values.tenantName}
                  onChange={(event) => updateValue("tenantName", event.target.value)}
                  placeholder="Clinica Exemplo"
                  aria-invalid={Boolean(fieldErrors.tenantName)}
                  aria-describedby={fieldErrors.tenantName ? "tenant-name-error" : undefined}
                  disabled={provisionMutation.isPending}
                />
                {fieldErrors.tenantName ? (
                  <p id="tenant-name-error" className="text-sm text-red-300" role="alert">
                    {fieldErrors.tenantName}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="tenant-slug" className="text-sm font-semibold text-white">
                  Identificador (slug)
                </label>
                <Input
                  id="tenant-slug"
                  ref={fieldErrors.tenantSlug ? firstErrorFieldRef : undefined}
                  value={values.tenantSlug}
                  onChange={(event) => updateValue("tenantSlug", normalizeSlug(event.target.value))}
                  placeholder="clinica-exemplo"
                  aria-invalid={Boolean(fieldErrors.tenantSlug)}
                  aria-describedby={fieldErrors.tenantSlug ? "tenant-slug-error" : undefined}
                  disabled={provisionMutation.isPending}
                />
                {fieldErrors.tenantSlug ? (
                  <p id="tenant-slug-error" className="text-sm text-red-300" role="alert">
                    {fieldErrors.tenantSlug}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="tenant-timezone" className="text-sm font-semibold text-white">
                Timezone do tenant
              </label>
              <Select
                id="tenant-timezone"
                value={values.tenantTimezone}
                options={timezoneOptions}
                placeholder="Selecione um timezone"
                onValueChange={(value) => updateValue("tenantTimezone", value)}
                aria-describedby={fieldErrors.tenantTimezone ? "tenant-timezone-error" : undefined}
              />
              {fieldErrors.tenantTimezone ? (
                <p id="tenant-timezone-error" className="text-sm text-red-300" role="alert">
                  {fieldErrors.tenantTimezone}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="admin-name" className="text-sm font-semibold text-white">
                  Nome do admin inicial
                </label>
                <Input
                  id="admin-name"
                  ref={fieldErrors.adminName ? firstErrorFieldRef : undefined}
                  value={values.adminName}
                  onChange={(event) => updateValue("adminName", event.target.value)}
                  placeholder="Admin Inicial"
                  aria-invalid={Boolean(fieldErrors.adminName)}
                  aria-describedby={fieldErrors.adminName ? "admin-name-error" : undefined}
                  disabled={provisionMutation.isPending}
                />
                {fieldErrors.adminName ? (
                  <p id="admin-name-error" className="text-sm text-red-300" role="alert">
                    {fieldErrors.adminName}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="admin-email" className="text-sm font-semibold text-white">
                  Email do admin inicial
                </label>
                <Input
                  id="admin-email"
                  ref={fieldErrors.adminEmail ? firstErrorFieldRef : undefined}
                  value={values.adminEmail}
                  onChange={(event) => updateValue("adminEmail", event.target.value)}
                  placeholder="admin@clinicaexemplo.com"
                  aria-invalid={Boolean(fieldErrors.adminEmail)}
                  aria-describedby={fieldErrors.adminEmail ? "admin-email-error" : undefined}
                  disabled={provisionMutation.isPending}
                />
                {fieldErrors.adminEmail ? (
                  <p id="admin-email-error" className="text-sm text-red-300" role="alert">
                    {fieldErrors.adminEmail}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <Button type="submit" size="md" disabled={provisionMutation.isPending}>
                {provisionMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    Provisionando...
                  </>
                ) : (
                  "Criar mandante e admin"
                )}
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleCreateAnother}
                disabled={provisionMutation.isPending}
              >
                Limpar formulario
              </Button>
            </div>

            <div className="text-sm text-text-soft" aria-live="polite">
              Todos os timestamps sao registrados em UTC e a acao e auditada no backend.
            </div>
          </form>
        </Card>
      </div>
    </SystemAdminGate>
  );
}
