import { Badge } from "@/components/flow/badge";
import { Card } from "@/components/flow/card";
import { semanticTokens } from "@/design-system";
import { cn } from "@/lib/cn";

interface FeedbackBannerProps {
  title: string;
  description: string;
  tone?: "danger" | "info" | "warning";
  className?: string;
}

const toneStyles = {
  danger: {
    borderColor: semanticTokens.feedback.danger.border,
    backgroundColor: semanticTokens.feedback.danger.background,
  },
  info: {
    borderColor: semanticTokens.feedback.info.border,
    backgroundColor: semanticTokens.feedback.info.background,
  },
  warning: {
    borderColor: semanticTokens.feedback.warning.border,
    backgroundColor: semanticTokens.feedback.warning.background,
  },
} as const;

export function FeedbackBanner({ title, description, tone = "danger", className }: FeedbackBannerProps) {
  return (
    <Card
      padding="sm"
      radiusSize="lg"
      className={cn("border", className)}
      style={toneStyles[tone]}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Badge variant={tone}>{tone === "danger" ? "Erro" : tone === "warning" ? "Aviso" : "Info"}</Badge>
        <div>
          <p className="font-semibold text-white">{title}</p>
          <p className="mt-1 text-sm leading-6 text-text-soft">{description}</p>
        </div>
      </div>
    </Card>
  );
}
