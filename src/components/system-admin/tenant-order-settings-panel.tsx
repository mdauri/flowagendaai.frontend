import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/flow/button";
import { CardDescription, CardTitle } from "@/components/flow/card";
import { Checkbox } from "@/components/flow/checkbox";
import { Input } from "@/components/flow/input";
import { Textarea } from "@/components/flow/textarea";
import {
  useSystemAdminTenantOrderSettingsQuery,
  useUpdateSystemAdminTenantOrderSettingsMutation,
} from "@/hooks/use-order-module";
import { PageState } from "@/components/shared/page-state";
import { ApiError } from "@/types/api";

interface TenantOrderSettingsPanelProps {
  tenantId: string | null;
  onDirtyChange?: (dirty: boolean) => void;
}

export function TenantOrderSettingsPanel({
  tenantId,
  onDirtyChange,
}: TenantOrderSettingsPanelProps) {
  const settingsQuery = useSystemAdminTenantOrderSettingsQuery(tenantId);
  const updateMutation = useUpdateSystemAdminTenantOrderSettingsMutation(tenantId);
  const [orderModuleEnabled, setOrderModuleEnabled] = useState(false);
  const [storeActive, setStoreActive] = useState(false);
  const [storeWhatsappPhone, setStoreWhatsappPhone] = useState("");
  const [storePixKey, setStorePixKey] = useState("");
  const [storePixReceiverName, setStorePixReceiverName] = useState("");
  const [storePickupInstructions, setStorePickupInstructions] = useState("");
  const [storeDeliveryInstructions, setStoreDeliveryInstructions] = useState("");
  const [storeMinimumOrderValue, setStoreMinimumOrderValue] = useState("");
  const [storeMinimumLeadTimeHours, setStoreMinimumLeadTimeHours] = useState("");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!settingsQuery.data) {
      return;
    }

    setOrderModuleEnabled(settingsQuery.data.orderModuleEnabled);
    setStoreActive(settingsQuery.data.storeActive);
    setStoreWhatsappPhone(settingsQuery.data.storeWhatsappPhone ?? "");
    setStorePixKey(settingsQuery.data.storePixKey ?? "");
    setStorePixReceiverName(settingsQuery.data.storePixReceiverName ?? "");
    setStorePickupInstructions(settingsQuery.data.storePickupInstructions ?? "");
    setStoreDeliveryInstructions(settingsQuery.data.storeDeliveryInstructions ?? "");
    setStoreMinimumOrderValue(
      settingsQuery.data.storeMinimumOrderValue != null
        ? String(settingsQuery.data.storeMinimumOrderValue)
        : "",
    );
    setStoreMinimumLeadTimeHours(
      settingsQuery.data.storeMinimumLeadTimeHours != null
        ? String(settingsQuery.data.storeMinimumLeadTimeHours)
        : "",
    );
    setSaveMessage(null);
  }, [settingsQuery.data]);

  useEffect(() => {
    if (!tenantId || !settingsQuery.data) {
      onDirtyChange?.(false);
      return;
    }

    const isDirty =
      orderModuleEnabled !== settingsQuery.data.orderModuleEnabled ||
      storeActive !== settingsQuery.data.storeActive ||
      storeWhatsappPhone !== (settingsQuery.data.storeWhatsappPhone ?? "") ||
      storePixKey !== (settingsQuery.data.storePixKey ?? "") ||
      storePixReceiverName !== (settingsQuery.data.storePixReceiverName ?? "") ||
      storePickupInstructions !== (settingsQuery.data.storePickupInstructions ?? "") ||
      storeDeliveryInstructions !== (settingsQuery.data.storeDeliveryInstructions ?? "") ||
      storeMinimumOrderValue !==
        (settingsQuery.data.storeMinimumOrderValue != null
          ? String(settingsQuery.data.storeMinimumOrderValue)
          : "") ||
      storeMinimumLeadTimeHours !==
        (settingsQuery.data.storeMinimumLeadTimeHours != null
          ? String(settingsQuery.data.storeMinimumLeadTimeHours)
          : "");

    onDirtyChange?.(isDirty);
  }, [
    onDirtyChange,
    orderModuleEnabled,
    settingsQuery.data,
    storeActive,
    storeDeliveryInstructions,
    storeMinimumLeadTimeHours,
    storeMinimumOrderValue,
    storePickupInstructions,
    storePixKey,
    storePixReceiverName,
    storeWhatsappPhone,
    tenantId,
  ]);

  async function handleSave() {
    if (!tenantId) {
      return;
    }

    await updateMutation.mutateAsync({
      orderModuleEnabled,
      storeActive,
      storeWhatsappPhone: storeWhatsappPhone.trim() || null,
      storePixKey: storePixKey.trim() || null,
      storePixReceiverName: storePixReceiverName.trim() || null,
      storePickupInstructions: storePickupInstructions.trim() || null,
      storeDeliveryInstructions: storeDeliveryInstructions.trim() || null,
      storeMinimumOrderValue: storeMinimumOrderValue
        ? Number(storeMinimumOrderValue.replace(",", "."))
        : null,
      storeMinimumLeadTimeHours: storeMinimumLeadTimeHours
        ? Number(storeMinimumLeadTimeHours)
        : null,
    });

    setSaveMessage("Configuracoes salvas com sucesso.");
    onDirtyChange?.(false);
    window.setTimeout(() => setSaveMessage(null), 3000);
  }

  if (!tenantId) {
    return (
      <PageState
        title="Escolha um tenant"
        description="Selecione um tenant acima para editar Pedidos."
      />
    );
  }

  return (
    <div className="grid gap-4">
      <div>
        <CardTitle>Pedidos</CardTitle>
        <CardDescription className="mt-2">
          Controle o modulo, a loja publica e os dados operacionais de pedidos deste tenant.
        </CardDescription>
      </div>

      {settingsQuery.isLoading ? (
        <div className="mt-2 flex items-center gap-2 text-text-soft">
          <Loader2 size={16} className="animate-spin" />
          Carregando configuracao...
        </div>
      ) : settingsQuery.isError || !settingsQuery.data ? (
        <PageState
          title="Nao foi possivel carregar a configuracao"
          description={
            (settingsQuery.error as ApiError | null)?.message ?? "Tente novamente."
          }
          actionLabel="Recarregar"
          onAction={() => void settingsQuery.refetch()}
        />
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-4 rounded-3xl border border-[var(--theme-border-subtle)] bg-black/10 p-5">
            <label className="flex items-center gap-3">
              <Checkbox
                checked={orderModuleEnabled}
                onCheckedChange={setOrderModuleEnabled}
                disabled={updateMutation.isPending}
              />
              <span className="text-sm font-semibold text-[var(--theme-text-primary)]">
                Modulo de pedidos habilitado
              </span>
            </label>
            <label className="flex items-center gap-3">
              <Checkbox
                checked={storeActive}
                onCheckedChange={setStoreActive}
                disabled={updateMutation.isPending}
              />
              <span className="text-sm font-semibold text-[var(--theme-text-primary)]">
                Loja publica ativa
              </span>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[var(--theme-text-primary)]">
                WhatsApp
              </label>
              <Input
                value={storeWhatsappPhone}
                onChange={(event) => setStoreWhatsappPhone(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[var(--theme-text-primary)]">
                Chave Pix
              </label>
              <Input
                value={storePixKey}
                onChange={(event) => setStorePixKey(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[var(--theme-text-primary)]">
                Recebedor do Pix
              </label>
              <Input
                value={storePixReceiverName}
                onChange={(event) => setStorePixReceiverName(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[var(--theme-text-primary)]">
                Pedido minimo
              </label>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={storeMinimumOrderValue}
                onChange={(event) => setStoreMinimumOrderValue(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[var(--theme-text-primary)]">
                Antecedencia minima em horas
              </label>
              <Input
                type="number"
                step="1"
                min={0}
                value={storeMinimumLeadTimeHours}
                onChange={(event) => setStoreMinimumLeadTimeHours(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[var(--theme-text-primary)]">
                Instrucoes de retirada
              </label>
              <Textarea
                size="md"
                value={storePickupInstructions}
                onChange={(event) => setStorePickupInstructions(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[var(--theme-text-primary)]">
                Instrucoes de entrega
              </label>
              <Textarea
                size="md"
                value={storeDeliveryInstructions}
                onChange={(event) => setStoreDeliveryInstructions(event.target.value)}
              />
            </div>
          </div>

          {updateMutation.isError ? (
            <div className="rounded-2xl border border-[rgba(248,113,113,0.28)] bg-[rgba(239,68,68,0.10)] px-4 py-3 text-sm text-[#F87171]">
              {(updateMutation.error as ApiError | null)?.message ??
                "Nao foi possivel salvar."}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => void handleSave()}
              size="md"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar configuracoes"
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
