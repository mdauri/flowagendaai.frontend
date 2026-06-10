import { FeedbackBanner } from "@/components/shared/feedback-banner";

interface DemoEnvironmentBannerProps {
  tenantSlug?: string | null;
  className?: string;
}

export function DemoEnvironmentBanner({ tenantSlug, className }: DemoEnvironmentBannerProps) {
  if (tenantSlug !== "demo") {
    return null;
  }

  return (
    <FeedbackBanner
      title="⚠ Ambiente de Demonstração"
      description="Os dados podem ser restaurados automaticamente."
      tone="warning"
      className={className}
    />
  );
}
