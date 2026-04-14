import { Badge } from "@/components/flow/badge";
import { cn } from "@/lib/cn";

export interface MultiDayBadgeProps {
  daysCount: number;
  variant?: "compact" | "full";
  className?: string;
}

export function MultiDayBadge({ daysCount, variant = "full", className }: MultiDayBadgeProps) {
  const labelText = variant === "compact" ? `${daysCount}d` : `Multi-dia: ${daysCount} dias`;
  const ariaLabel =
    variant === "compact"
      ? `Servico multi-dia, ${daysCount} dias`
      : `Servico multi-dia que abrange ${daysCount} dias`;

  return (
    <Badge variant="info" className={cn("gap-1.5", className)} aria-label={ariaLabel}>
      <span aria-hidden="true">&#128197;</span>
      {variant === "full" && <span>{labelText}</span>}
      {variant === "compact" && <span>{labelText}</span>}
    </Badge>
  );
}
