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
      className={cn("min-w-0 border", className)}
      style={toneStyles[tone]}
      role="alert"
      aria-live="polite"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <Badge variant={tone}>{tone === "danger" ? "Erro" : tone === "warning" ? "Aviso" : "Info"}</Badge>
        <div className="min-w-0">
          <p className="font-semibold text-[var(--theme-text-primary)]">{title}</p>
          <p className="mt-1 text-sm leading-6 text-text-soft">{description}</p>
        </div>
      </div>
    </Card>
  );
}
