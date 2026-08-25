import * as React from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { useActivationQuery } from "@/hooks/use-activation-query";
import { useSetOnboardingVisibilityMutation } from "@/hooks/use-set-onboarding-visibility-mutation";

export function OnboardingVisibilityCard() {
  const query = useActivationQuery();
  const mutation = useSetOnboardingVisibilityMutation();
  const [reopened, setReopened] = React.useState(false);

  if (query.isLoading) {
    return <Card aria-label="Carregando configuração inicial" className="animate-pulse"><div className="h-20 rounded-xl bg-white/5" /></Card>;
  }

  if (query.isError || !query.data) {
    return (
      <div className="grid gap-3">
        <FeedbackBanner title="Não foi possível carregar a configuração inicial" description="Tente novamente para consultar a visibilidade do checklist." />
        <Button variant="secondary" size="sm" className="w-fit" onClick={() => void query.refetch()}>
          <RotateCcw size={14} aria-hidden="true" /> Tentar novamente
        </Button>
      </div>
    );
  }

  const isDismissed = query.data.visibility === "DISMISSED";

  async function reopen() {
    try {
      await mutation.mutateAsync("VISIBLE");
      setReopened(true);
    } catch {
      // The mutation state below provides the user-facing error.
    }
  }

  return (
    <Card padding="md" className="space-y-3" data-testid="onboarding-visibility-settings">
      <div>
        <CardTitle className="text-lg">Configuração inicial</CardTitle>
        <CardDescription className="mt-1">
          {isDismissed ? "Checklist oculto" : "Checklist visível no dashboard"}
        </CardDescription>
      </div>
      {isDismissed ? (
        <Button size="sm" onClick={() => void reopen()} disabled={mutation.isPending}>
          {mutation.isPending ? "Mostrando..." : "Mostrar checklist de configuração"}
        </Button>
      ) : null}
      {mutation.isError ? <p role="alert" className="text-sm text-red-300">Não foi possível atualizar a visibilidade. Tente novamente.</p> : null}
      {reopened ? <p role="status" className="text-sm text-emerald-300">Checklist de configuração reaberto.</p> : null}
    </Card>
  );
}
