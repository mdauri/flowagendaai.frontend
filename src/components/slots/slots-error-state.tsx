import { Button } from "@/components/flow/button";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { Card } from "@/components/flow/card";

interface SlotsErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function SlotsErrorState({ message, onRetry }: SlotsErrorStateProps) {
  return (
    <Card variant="glass" padding="lg" className="grid gap-4">
      <FeedbackBanner
        title="Nao foi possivel consultar os horarios"
        description={message}
      />

      <div>
        <Button type="button" variant="secondary" size="md" onClick={onRetry}>
          Tentar novamente
        </Button>
      </div>
    </Card>
  );
}
