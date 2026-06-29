import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Checkbox } from "@/components/flow/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { tenantService } from "@/services/tenant-service";
import { ApiError } from "@/types/api";

export function SubscriptionClubConfig() {
  const auth = useAuth();
  const tenant = auth.tenant;
  const [enabled, setEnabled] = useState(Boolean(tenant?.subscriptionClubEnabled));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!tenant?.subscriptionClubAllowed) {
    return null;
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      await tenantService.updateTenant({
        subscriptionClubEnabled: enabled,
      });
      await auth.refetchCurrentUser();
      setMessage("Configuracao do Clube salva.");
      setTimeout(() => setMessage(null), 3000);
    } catch (saveError) {
      if (
        saveError instanceof ApiError &&
        saveError.code === "SUBSCRIPTION_MODULE_NOT_ALLOWED_FOR_TENANT"
      ) {
        setError("Clube nao liberado para este tenant.");
      } else {
        setError("Nao foi possivel salvar a configuracao do Clube.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card variant="glass" padding="lg" className="grid gap-4">
      <div>
        <CardTitle>Clube de Assinaturas</CardTitle>
        <CardDescription className="mt-2">
          Ative ou desative o modulo operacional para planos mensais e consumo por booking.
        </CardDescription>
      </div>

      <label className="flex items-start gap-3 rounded-2xl border border-[var(--theme-border-subtle)] bg-black/10 p-4">
        <Checkbox checked={enabled} onCheckedChange={setEnabled} disabled={isSaving} />
        <div className="grid gap-1">
          <span className="text-sm font-semibold text-[var(--theme-text-primary)]">
            Ativar Clube neste tenant
          </span>
          <span className="text-xs text-text-soft">
            Quando desativado, o Clube nao aparece nos fluxos operacionais.
          </span>
        </div>
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="md" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Clube"
          )}
        </Button>
        {message ? <span className="text-sm text-[var(--theme-text-primary)]">{message}</span> : null}
      </div>

      {error ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}
    </Card>
  );
}
