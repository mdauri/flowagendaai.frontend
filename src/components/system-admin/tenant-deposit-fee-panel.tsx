import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/flow/button";
import { CardDescription, CardTitle } from "@/components/flow/card";
import { Checkbox } from "@/components/flow/checkbox";
import { PageState } from "@/components/shared/page-state";
import { systemAdminService } from "@/services/system-admin-service";

interface TenantDepositFeePanelProps {
  tenantId: string | null;
  onDirtyChange?: (dirty: boolean) => void;
}

export function TenantDepositFeePanel({
  tenantId,
  onDirtyChange,
}: TenantDepositFeePanelProps) {
  const queryClient = useQueryClient();
  const [depositModuleEnabled, setDepositModuleEnabled] = useState(false);
  const [depositConvenienceFeeEnabled, setDepositConvenienceFeeEnabled] =
    useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const depositFeeSettingsQuery = useQuery({
    queryKey: ["system-admin", "tenant-deposit-fee", tenantId],
    queryFn: () => systemAdminService.getTenantDepositFeeSettings(tenantId as string),
    enabled: Boolean(tenantId),
  });

  const saveMutation = useMutation({
    mutationFn: (input: {
      tenantId: string;
      depositModuleEnabled: boolean;
      depositConvenienceFeeEnabled: boolean;
    }) =>
      systemAdminService.updateTenantDepositFeeSettings(input.tenantId, {
        depositModuleEnabled: input.depositModuleEnabled,
        depositConvenienceFeeEnabled: input.depositConvenienceFeeEnabled,
      }),
    onSuccess: async (result) => {
      setDepositModuleEnabled(result.tenant.depositModuleEnabled);
      setDepositConvenienceFeeEnabled(
        result.tenant.depositConvenienceFeeEnabled,
      );
      setSaveMessage("Configuracao salva com sucesso.");
      await queryClient.invalidateQueries({
        queryKey: ["system-admin", "tenant-deposit-fee", tenantId],
      });
      window.setTimeout(() => setSaveMessage(null), 3000);
    },
  });

  useEffect(() => {
    if (depositFeeSettingsQuery.data) {
      setDepositModuleEnabled(
        depositFeeSettingsQuery.data.tenant.depositModuleEnabled,
      );
      setDepositConvenienceFeeEnabled(
        depositFeeSettingsQuery.data.tenant.depositConvenienceFeeEnabled,
      );
      setSaveMessage(null);
    }
  }, [depositFeeSettingsQuery.data]);

  useEffect(() => {
    if (!tenantId || !depositFeeSettingsQuery.data) {
      onDirtyChange?.(false);
      return;
    }

    onDirtyChange?.(
      depositModuleEnabled !==
        depositFeeSettingsQuery.data.tenant.depositModuleEnabled ||
        depositConvenienceFeeEnabled !==
          depositFeeSettingsQuery.data.tenant.depositConvenienceFeeEnabled,
    );
  }, [
    depositConvenienceFeeEnabled,
    depositFeeSettingsQuery.data,
    depositModuleEnabled,
    onDirtyChange,
    tenantId,
  ]);

  if (!tenantId) {
    return (
      <PageState
        title="Escolha um tenant"
        description="Selecione um tenant acima para editar o Sinal Online."
      />
    );
  }

  return (
    <div className="grid gap-4">
      <div>
        <CardTitle>Sinal Online</CardTitle>
        <CardDescription className="mt-2">
          Ative o modulo e controle a taxa de conveniencia deste tenant.
        </CardDescription>
      </div>

      {depositFeeSettingsQuery.isLoading ? (
        <div className="mt-2 flex items-center gap-2 text-text-soft">
          <Loader2 size={16} className="animate-spin" />
          Carregando configuracao...
        </div>
      ) : depositFeeSettingsQuery.isError ? (
        <PageState
          title="Nao foi possivel carregar a configuracao"
          description="Tente novamente."
          actionLabel="Recarregar"
          onAction={() => void depositFeeSettingsQuery.refetch()}
        />
      ) : (
        <div className="grid gap-4">
          <label className="flex items-start gap-3 rounded-2xl border border-[var(--theme-border-subtle)] bg-black/10 p-4">
            <Checkbox
              checked={depositModuleEnabled}
              onCheckedChange={setDepositModuleEnabled}
              disabled={saveMutation.isPending}
            />
            <div className="grid gap-1">
              <span className="text-sm font-semibold text-[var(--theme-text-primary)]">
                Habilitar modulo Sinal Online
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
                Cobrar taxa de conveniencia
              </span>
              <span className="text-xs text-text-soft">
                Quando ativo, o tenant fica marcado para aplicar a taxa de conveniencia do Sinal.
              </span>
            </div>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="md"
              onClick={() =>
                void saveMutation.mutateAsync({
                  tenantId,
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
              <span className="text-sm text-[var(--theme-text-primary)]">
                {saveMessage}
              </span>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
