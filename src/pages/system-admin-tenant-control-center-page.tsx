import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "react-router";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { SectionHeading } from "@/components/flow/section-heading";
import { Select, type SelectOption } from "@/components/flow/select";
import { PageState } from "@/components/shared/page-state";
import { WhatsAppIntegrationConfig } from "@/components/settings/whatsapp-integration-config";
import { ApiTokensPanel } from "@/components/system-admin/api-tokens-panel";
import { DiscardChangesDialog } from "@/components/system-admin/discard-changes-dialog";
import { SubscriptionClubPanel } from "@/components/system-admin/subscription-club-panel";
import { SystemAdminGate } from "@/components/system-admin/system-admin-gate";
import { TenantDepositFeePanel } from "@/components/system-admin/tenant-deposit-fee-panel";
import { TenantBillingPanel } from "@/components/system-admin/tenant-billing-panel";
import { useAuth } from "@/hooks/use-auth";
import { useSystemAdminTenantsQuery } from "@/hooks/use-system-admin-tenants-query";
import { cn } from "@/lib/cn";

const moduleTabs = [
  {
    key: "whatsapp",
    label: "WhatsApp",
  },
  {
    key: "api-tokens",
    label: "API Tokens",
  },
  {
    key: "subscription-club",
    label: "Clube",
  },
  {
    key: "deposit-fee",
    label: "Sinal Online",
  },
  {
    key: "billing",
    label: "Billing SaaS",
  },
] as const;

type ModuleTabKey = (typeof moduleTabs)[number]["key"];
type PendingNavigation =
  | { type: "tab"; value: ModuleTabKey }
  | { type: "tenant"; value: string }
  | null;

function normalizeTab(value: string | null): ModuleTabKey {
  const match = moduleTabs.find((tab) => tab.key === value);
  return match?.key ?? "whatsapp";
}

export function SystemAdminTenantControlCenterPage() {
  const auth = useAuth();
  const tenantsQuery = useSystemAdminTenantsQuery();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [activeModuleDirty, setActiveModuleDirty] = useState(false);
  const [pendingNavigation, setPendingNavigation] =
    useState<PendingNavigation>(null);

  const isAllowed = useMemo(
    () => auth.user?.role === "system-admin",
    [auth.user?.role],
  );

  const currentTab = normalizeTab(searchParams.get("tab"));
  const selectedTenant =
    tenantsQuery.data?.items.find((tenant) => tenant.id === selectedTenantId) ??
    null;

  const tenantOptions: SelectOption[] = (tenantsQuery.data?.items ?? []).map(
    (tenant) => ({
      value: tenant.id,
      label: `${tenant.name} (${tenant.slug})`,
    }),
  );

  function applyTabChange(tab: ModuleTabKey) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", tab);
    setSearchParams(nextParams, { replace: true });
    setActiveModuleDirty(false);
  }

  function applyTenantChange(nextTenantId: string) {
    setSelectedTenantId(nextTenantId);
    setActiveModuleDirty(false);
  }

  function handleTabChange(tab: ModuleTabKey) {
    if (activeModuleDirty) {
      setPendingNavigation({ type: "tab", value: tab });
      return;
    }

    applyTabChange(tab);
  }

  function handleTenantChange(nextTenantId: string) {
    if (activeModuleDirty) {
      setPendingNavigation({ type: "tenant", value: nextTenantId });
      return;
    }

    applyTenantChange(nextTenantId);
  }

  function handleDiscardConfirm() {
    if (!pendingNavigation) {
      return;
    }

    if (pendingNavigation.type === "tab") {
      applyTabChange(pendingNavigation.value);
    } else {
      applyTenantChange(pendingNavigation.value);
    }

    setPendingNavigation(null);
  }

  function renderActiveModule() {
    switch (currentTab) {
      case "api-tokens":
        return <ApiTokensPanel tenantId={selectedTenantId || null} onDirtyChange={setActiveModuleDirty} />;
      case "subscription-club":
        return <SubscriptionClubPanel tenantId={selectedTenantId || null} onDirtyChange={setActiveModuleDirty} />;
      case "deposit-fee":
        return <TenantDepositFeePanel tenantId={selectedTenantId || null} onDirtyChange={setActiveModuleDirty} />;
      case "billing":
        return <TenantBillingPanel tenantId={selectedTenantId || null} />;
      case "whatsapp":
      default:
        return <WhatsAppIntegrationConfig tenantId={selectedTenantId || null} onDirtyChange={setActiveModuleDirty} />;
    }
  }

  useEffect(() => {
    if (!activeModuleDirty) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activeModuleDirty]);

  if (!isAllowed) {
    return (
      <PageState
        title="Acesso restrito"
        description="Apenas system-admin pode acessar a central de tenants."
      />
    );
  }

  return (
    <SystemAdminGate
      isAllowed={isAllowed}
      fallbackDescription="Apenas system-admin pode acessar a central de tenants."
    >
      <SectionHeading
        eyebrow="System Admin"
        title="Central do tenant"
        description="Escolha um tenant e ajuste acessos, WhatsApp e modulos."
      />

      <Card variant="premium" padding="lg" className="mt-8 min-w-0">
        <CardTitle>Tenant</CardTitle>
        <CardDescription className="mt-2">
          Selecione um tenant para abrir a central.
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
          <div className="mt-4 grid gap-4">
            <div className="grid gap-2">
              <label
                className="text-sm font-semibold text-[var(--theme-text-primary)]"
                htmlFor="tenant-control-center-tenant"
              >
                Tenant
              </label>
              <Select
                id="tenant-control-center-tenant"
                value={selectedTenantId}
                options={tenantOptions}
                placeholder="Selecione um tenant"
                onValueChange={handleTenantChange}
              />
            </div>

            {selectedTenant ? (
              <div className="grid gap-1 rounded-2xl border border-[var(--theme-border-subtle)] bg-black/10 p-4">
                <p className="text-sm font-semibold text-white">
                  {selectedTenant.name}
                </p>
                <p className="text-xs text-text-soft">
                  slug: {selectedTenant.slug}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </Card>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Modulos do tenant">
        {moduleTabs.map((tab) => {
          const isActive = currentTab === tab.key;
          const isDisabled = !selectedTenantId;

          return (
            <button
              key={tab.key}
              id={`tenant-module-tab-${tab.key}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tenant-module-panel-${tab.key}`}
              disabled={isDisabled}
              onClick={() => handleTabChange(tab.key)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                isActive
                  ? "border-primary bg-primary text-black"
                  : "border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] text-text-soft hover:border-[var(--theme-border-default)] hover:text-[var(--theme-text-primary)]",
                isDisabled ? "cursor-not-allowed opacity-60 hover:border-[var(--theme-border-subtle)] hover:text-text-soft" : "",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <Card
        variant="glass"
        padding="lg"
        className="mt-6 min-w-0"
        role="tabpanel"
        id={`tenant-module-panel-${currentTab}`}
        aria-labelledby={`tenant-module-tab-${currentTab}`}
      >
        {renderActiveModule()}
      </Card>

      <DiscardChangesDialog
        isOpen={Boolean(pendingNavigation)}
        title="Descartar alteracoes?"
        description={
          pendingNavigation?.type === "tenant"
            ? "Voce tem alteracoes nao salvas. Trocar de tenant agora vai descartar esse progresso."
            : "Voce tem alteracoes nao salvas. Sair deste modulo agora vai descartar esse progresso."
        }
        onClose={() => setPendingNavigation(null)}
        onConfirm={handleDiscardConfirm}
      />
    </SystemAdminGate>
  );
}
