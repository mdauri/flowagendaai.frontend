import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Select, type SelectOption } from "@/components/flow/select";
import { PageState } from "@/components/shared/page-state";
import { SectionHeading } from "@/components/flow/section-heading";
import { SystemAdminGate } from "@/components/system-admin/system-admin-gate";
import { WhatsAppIntegrationConfig } from "@/components/settings/whatsapp-integration-config";
import { useAuth } from "@/hooks/use-auth";
import { useSystemAdminTenantsQuery } from "@/hooks/use-system-admin-tenants-query";

export function SystemAdminTenantWhatsAppPage() {
  const auth = useAuth();
  const tenantsQuery = useSystemAdminTenantsQuery();
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");

  const isAllowed = useMemo(() => auth.user?.role === "system-admin", [auth.user?.role]);

  const tenantOptions: SelectOption[] = (tenantsQuery.data?.items ?? []).map((tenant) => ({
    value: tenant.id,
    label: `${tenant.name} (${tenant.slug})`,
  }));

  if (!isAllowed) {
    return (
      <PageState
        title="Acesso restrito"
        description="Apenas system-admin pode configurar WhatsApp de tenants."
      />
    );
  }

  return (
    <SystemAdminGate isAllowed={isAllowed} fallbackDescription="Apenas system-admin pode configurar WhatsApp de tenants.">
      <SectionHeading
        eyebrow="System Admin"
        title="WhatsApp por tenant"
        description="Selecione um tenant para configurar o numero WhatsApp, webhook e segredos da Meta."
      />

      <Card variant="premium" padding="lg" className="mt-8">
        <CardTitle>Tenant alvo</CardTitle>
        <CardDescription className="mt-2">
          Selecione o tenant para carregar e editar a integracao WhatsApp.
        </CardDescription>
        {tenantsQuery.isLoading ? (
          <div className="mt-4 flex items-center gap-2 text-text-soft">
            <Loader2 size={16} className="animate-spin" />
            Carregando tenants...
          </div>
        ) : tenantsQuery.isError ? (
          <PageState
            title="Falha ao carregar tenants"
            description="Nao foi possivel carregar a lista de tenants."
            actionLabel="Tentar novamente"
            onAction={() => void tenantsQuery.refetch()}
          />
        ) : (
          <div className="mt-4 grid gap-2">
            <label
              className="text-sm font-semibold text-[var(--theme-text-primary)]"
              htmlFor="whatsapp-tenant"
            >
              Tenant
            </label>
            <Select
              id="whatsapp-tenant"
              value={selectedTenantId}
              options={tenantOptions}
              placeholder="Selecione um tenant"
              onValueChange={setSelectedTenantId}
            />
          </div>
        )}
      </Card>

      <div className="mt-6">
        <WhatsAppIntegrationConfig tenantId={selectedTenantId || null} />
      </div>
    </SystemAdminGate>
  );
}
