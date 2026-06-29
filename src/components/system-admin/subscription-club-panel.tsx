import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/flow/button";
import { CardDescription, CardTitle } from "@/components/flow/card";
import { Checkbox } from "@/components/flow/checkbox";
import { PageState } from "@/components/shared/page-state";
import { useSaveSystemAdminSubscriptionClubMutation } from "@/hooks/use-save-system-admin-subscription-club-mutation";
import { useSystemAdminSubscriptionClubQuery } from "@/hooks/use-system-admin-subscription-club-query";

interface SubscriptionClubPanelProps {
  tenantId: string | null;
  onDirtyChange?: (dirty: boolean) => void;
}

export function SubscriptionClubPanel({
  tenantId,
  onDirtyChange,
}: SubscriptionClubPanelProps) {
  const [subscriptionClubAllowed, setSubscriptionClubAllowed] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const settingsQuery = useSystemAdminSubscriptionClubQuery(tenantId ?? "");
  const saveMutation = useSaveSystemAdminSubscriptionClubMutation();

  useEffect(() => {
    if (settingsQuery.data) {
      setSubscriptionClubAllowed(
        settingsQuery.data.tenant.subscriptionClubAllowed,
      );
      setSaveMessage(null);
    }
  }, [settingsQuery.data]);

  useEffect(() => {
    if (!tenantId || !settingsQuery.data) {
      onDirtyChange?.(false);
      return;
    }

    onDirtyChange?.(
      subscriptionClubAllowed !==
        settingsQuery.data.tenant.subscriptionClubAllowed,
    );
  }, [onDirtyChange, settingsQuery.data, subscriptionClubAllowed, tenantId]);

  async function handleSave() {
    if (!tenantId) {
      return;
    }

    const result = await saveMutation.mutateAsync({
      tenantId,
      subscriptionClubAllowed,
    });
    setSubscriptionClubAllowed(result.tenant.subscriptionClubAllowed);
    setSaveMessage("Configuracao salva com sucesso.");
    onDirtyChange?.(false);
    window.setTimeout(() => setSaveMessage(null), 3000);
  }

  if (!tenantId) {
    return (
      <PageState
        title="Escolha um tenant"
        description="Selecione um tenant acima para editar o Clube."
      />
    );
  }

  return (
    <div className="grid gap-4">
      <div>
        <CardTitle>Clube</CardTitle>
        <CardDescription className="mt-2">
          Libere ou bloqueie o modulo para este tenant.
        </CardDescription>
      </div>

      {settingsQuery.isLoading ? (
        <div className="mt-2 flex items-center gap-2 text-text-soft">
          <Loader2 size={16} className="animate-spin" />
          Carregando configuracao...
        </div>
      ) : settingsQuery.isError ? (
        <PageState
          title="Nao foi possivel carregar a configuracao"
          description="Tente novamente."
          actionLabel="Recarregar"
          onAction={() => void settingsQuery.refetch()}
        />
      ) : (
        <div className="grid gap-4">
          <label className="flex items-start gap-3 rounded-2xl border border-[var(--theme-border-subtle)] bg-black/10 p-4">
            <Checkbox
              checked={subscriptionClubAllowed}
              onCheckedChange={setSubscriptionClubAllowed}
              disabled={saveMutation.isPending}
            />
            <div className="grid gap-1">
              <span className="text-sm font-semibold text-[var(--theme-text-primary)]">
                Liberar Clube para este tenant
              </span>
              <span className="text-xs text-text-soft">
                Se bloqueado, o backend tambem deve impedir a ativacao operacional do tenant.
              </span>
            </div>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="md"
              onClick={() => void handleSave()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
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
