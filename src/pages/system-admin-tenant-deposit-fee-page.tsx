import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Checkbox } from "@/components/flow/checkbox";
import { Select, type SelectOption } from "@/components/flow/select";
import { SectionHeading } from "@/components/flow/section-heading";
import { PageState } from "@/components/shared/page-state";
import { SystemAdminGate } from "@/components/system-admin/system-admin-gate";
import { useAuth } from "@/hooks/use-auth";
import { useSystemAdminTenantsQuery } from "@/hooks/use-system-admin-tenants-query";
import { systemAdminService } from "@/services/system-admin-service";

export function SystemAdminTenantDepositFeePage() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const tenantsQuery = useSystemAdminTenantsQuery();
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [depositModuleEnabled, setDepositModuleEnabled] = useState(false);
  const [depositConvenienceFeeEnabled, setDepositConvenienceFeeEnabled] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const isAllowed = useMemo(() => auth.user?.role === "system-admin", [auth.user?.role]);

  const tenantOptions: SelectOption[] = (tenantsQuery.data?.items ?? []).map((tenant) => ({
    value: tenant.id,
    label: `${tenant.name} (${tenant.slug})`,
  }));

  const depositFeeSettingsQuery = useQuery({
    queryKey: ["system-admin", "tenant-deposit-fee", selectedTenantId],
    queryFn: () => systemAdminService.getTenantDepositFeeSettings(selectedTenantId),
    enabled: isAllowed && Boolean(selectedTenantId),
  });

  const saveMutation = useMutation({
    mutationFn: (input: { tenantId: string; depositModuleEnabled: boolean; depositConvenienceFeeEnabled: boolean }) =>
      systemAdminService.updateTenantDepositFeeSettings(input.tenantId, {
        depositModuleEnabled: input.depositModuleEnabled,
        depositConvenienceFeeEnabled: input.depositConvenienceFeeEnabled,
      }),
    onSuccess: async (result) => {
      setDepositModuleEnabled(result.tenant.depositModuleEnabled);
      setDepositConvenienceFeeEnabled(result.tenant.depositConvenienceFeeEnabled);
      setSaveMessage("Configuracao salva com sucesso.");
      await queryClient.invalidateQueries({
        queryKey: ["system-admin", "tenant-deposit-fee", selectedTenantId],
      });
      setTimeout(() => setSaveMessage(null), 3000);
    },
  });

  useEffect(() => {
    if (depositFeeSettingsQuery.data) {
      setDepositModuleEnabled(
        depositFeeSettingsQuery.data.tenant.depositModuleEnabled
      );
      setDepositConvenienceFeeEnabled(
        depositFeeSettingsQuery.data.tenant.depositConvenienceFeeEnabled
      );
      setSaveMessage(null);
    }
  }, [depositFeeSettingsQuery.data]);

  if (!isAllowed) {
    return (
      <PageState
        title="Acesso restrito"
        description="Apenas system-admin pode configurar o Sinal Online do tenant."
      />
    );
  }

  return (
    <SystemAdminGate
      isAllowed={isAllowed}
      fallbackDescription="Apenas system-admin pode configurar o Sinal Online do tenant."
    >
      <SectionHeading
        eyebrow="System Admin"
        title="Sinal Online do tenant"
        description="Configure por tenant se o módulo de sinal fica habilitado e se a taxa de conveniência deve ser aplicada."
      />

      <Card variant="premium" padding="lg" className="mt-8">
        <CardTitle>Tenant alvo</CardTitle>
        <CardDescription className="mt-2">
          Selecione o tenant para ajustar a configuração de Sinal Online.
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
            <label className="text-sm font-semibold text-[var(--theme-text-primary)]" htmlFor="deposit-fee-tenant">
              Tenant
            </label>
            <Select
              id="deposit-fee-tenant"
              value={selectedTenantId}
              options={tenantOptions}
              placeholder="Selecione um tenant"
              onValueChange={(value) => {
                setSelectedTenantId(value);
                setSaveMessage(null);
              }}
            />
          </div>
        )}
      </Card>

      <Card variant="glass" padding="lg" className="mt-6">
        <CardTitle>Configuração de Sinal Online</CardTitle>
        <CardDescription className="mt-2">
          {selectedTenantId
            ? "Ative ou desative o módulo de sinal e a taxa de conveniência para este tenant."
            : "Selecione um tenant para editar essa configuracao."}
        </CardDescription>

        {depositFeeSettingsQuery.isLoading ? (
          <div className="mt-4 flex items-center gap-2 text-text-soft">
            <Loader2 size={16} className="animate-spin" />
            Carregando configuracao...
          </div>
        ) : depositFeeSettingsQuery.isError ? (
          <div className="mt-4">
            <PageState
              title="Nao foi possivel carregar a configuracao"
              description="Tente novamente."
              actionLabel="Recarregar"
              onAction={() => void depositFeeSettingsQuery.refetch()}
            />
          </div>
        ) : selectedTenantId ? (
          <div className="mt-4 grid gap-4">
            <label className="flex items-start gap-3 rounded-2xl border border-[var(--theme-border-subtle)] bg-black/10 p-4">
              <Checkbox
                checked={depositModuleEnabled}
                onCheckedChange={setDepositModuleEnabled}
                disabled={saveMutation.isPending}
              />
              <div className="grid gap-1">
                <span className="text-sm font-semibold text-[var(--theme-text-primary)]">
                  Habilitar módulo Sinal Online
                </span>
                <span className="text-xs text-text-soft">
                  Quando desativado, o tenant nao pode exigir sinal em servicos.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-2xl border border-[var(--theme-border-subtle)] bg-black/10 p-4">
              <Checkbox
                checked={depositConvenienceFeeEnabled}
                onCheckedChange={setDepositConvenienceFeeEnabled}
                disabled={saveMutation.isPending}
              />
              <div className="grid gap-1">
                <span className="text-sm font-semibold text-[var(--theme-text-primary)]">
                  Cobrar taxa de conveniência
                </span>
                <span className="text-xs text-text-soft">
                  Quando ativo, o tenant fica marcado para aplicar a taxa de conveniência do Sinal.
                </span>
              </div>
            </label>

            <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="md"
                  onClick={() =>
                    void saveMutation.mutateAsync({
                      tenantId: selectedTenantId,
                      depositModuleEnabled,
                      depositConvenienceFeeEnabled,
                    })
                  }
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    Salvando...
                  </>
                ) : (
                  "Salvar configuracao"
                )}
              </Button>
              {saveMessage ? (
                <span className="text-sm text-[var(--theme-text-primary)]">{saveMessage}</span>
              ) : null}
            </div>

            <p className="text-xs text-text-soft">
              O valor da taxa nao e calculado aqui. Esta tela apenas controla os toggles por tenant.
            </p>
          </div>
        ) : (
          <PageState
            title="Nenhum tenant selecionado"
            description="Escolha um tenant acima para continuar."
          />
        )}
      </Card>
    </SystemAdminGate>
  );
}
