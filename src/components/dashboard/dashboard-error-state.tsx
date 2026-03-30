import { Button } from "@/components/flow/button";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { ApiError } from "@/types/api";

interface DashboardErrorStateProps {
  error: unknown;
  onRetry: () => void;
}

function resolveErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "Nao foi possivel carregar o dashboard operacional.";
}

export function DashboardErrorState({ error, onRetry }: DashboardErrorStateProps) {
  return (
    <div className="grid gap-4">
      <FeedbackBanner
        title="Falha ao carregar o dashboard"
        description={resolveErrorMessage(error)}
      />
      <div>
        <Button variant="secondary" size="md" onClick={onRetry}>
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
