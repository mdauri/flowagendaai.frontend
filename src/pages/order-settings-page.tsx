import { useEffect, useState } from "react";
import { Button } from "@/components/flow/button";
import { Checkbox } from "@/components/flow/checkbox";
import { Input } from "@/components/flow/input";
import { SectionHeading } from "@/components/flow/section-heading";
import { Textarea } from "@/components/flow/textarea";
import { PageState } from "@/components/shared/page-state";
import { useOrderSettingsQuery, useUpdateOrderSettingsMutation } from "@/hooks/use-order-module";
import { ApiError } from "@/types/api";

export function OrderSettingsPage() {
  const settingsQuery = useOrderSettingsQuery();
  const updateMutation = useUpdateOrderSettingsMutation();
  const [orderModuleEnabled, setOrderModuleEnabled] = useState(false);
  const [storeActive, setStoreActive] = useState(false);
  const [storeWhatsappPhone, setStoreWhatsappPhone] = useState("");
  const [storePixKey, setStorePixKey] = useState("");
  const [storePixReceiverName, setStorePixReceiverName] = useState("");
  const [storePickupInstructions, setStorePickupInstructions] = useState("");
  const [storeDeliveryInstructions, setStoreDeliveryInstructions] = useState("");
  const [storeMinimumOrderValue, setStoreMinimumOrderValue] = useState("");
  const [storeMinimumLeadTimeHours, setStoreMinimumLeadTimeHours] = useState("");

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
  }, [settingsQuery.data]);

  async function handleSave() {
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
  }

  if (settingsQuery.isLoading) {
    return (
      <PageState
        title="Carregando loja"
        description="Estamos buscando as configuracoes do modulo de pedidos."
      />
    );
  }

  if (settingsQuery.isError || !settingsQuery.data) {
    return (
      <PageState
        title="Falha ao carregar a loja"
        description={
          (settingsQuery.error as ApiError | null)?.message ??
          "Nao foi possivel carregar as configuracoes."
        }
        actionLabel="Tentar novamente"
        onAction={() => void settingsQuery.refetch()}
      />
    );
  }

  return (
    <>
      <SectionHeading
        eyebrow="Pedidos"
        title="Loja"
        description="Configuracoes publicas do host de pedidos."
      />

      <div className="mt-8 grid gap-6">
        <div className="grid gap-4 rounded-3xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-5">
          <div className="flex items-center gap-3">
            <Checkbox checked={orderModuleEnabled} onCheckedChange={setOrderModuleEnabled} />
            <span className="text-sm font-semibold text-[var(--theme-text-primary)]">
              Modulo de pedidos habilitado
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox checked={storeActive} onCheckedChange={setStoreActive} />
            <span className="text-sm font-semibold text-[var(--theme-text-primary)]">
              Loja publica ativa
            </span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[var(--theme-text-primary)]">
              WhatsApp
            </label>
            <Input value={storeWhatsappPhone} onChange={(e) => setStoreWhatsappPhone(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[var(--theme-text-primary)]">
              Chave Pix
            </label>
            <Input value={storePixKey} onChange={(e) => setStorePixKey(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[var(--theme-text-primary)]">
              Recebedor do Pix
            </label>
            <Input value={storePixReceiverName} onChange={(e) => setStorePixReceiverName(e.target.value)} />
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
              onChange={(e) => setStoreMinimumOrderValue(e.target.value)}
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
              onChange={(e) => setStoreMinimumLeadTimeHours(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[var(--theme-text-primary)]">
              Instrucoes de retirada
            </label>
            <Textarea size="md" value={storePickupInstructions} onChange={(e) => setStorePickupInstructions(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[var(--theme-text-primary)]">
              Instrucoes de entrega
            </label>
            <Textarea size="md" value={storeDeliveryInstructions} onChange={(e) => setStoreDeliveryInstructions(e.target.value)} />
          </div>
        </div>

        {updateMutation.isError ? (
          <div className="rounded-2xl border border-[rgba(248,113,113,0.28)] bg-[rgba(239,68,68,0.10)] px-4 py-3 text-sm text-[#F87171]">
            {(updateMutation.error as ApiError | null)?.message ?? "Nao foi possivel salvar."}
          </div>
        ) : null}

        <div>
          <Button onClick={() => void handleSave()} size="md" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Salvando..." : "Salvar configuracoes"}
          </Button>
        </div>
      </div>
    </>
  );
}
