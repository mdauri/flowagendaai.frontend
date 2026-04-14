import { DateTime } from "luxon";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { Button } from "@/components/flow/button";
import { colors } from "@/design-system";

export interface MultiDayConflictErrorProps {
  conflictDay: string;
  conflictStart: string;
  conflictEnd: string;
  timezone: string;
  existingBookingName?: string;
  onRetry: () => void;
  className?: string;
}

export function MultiDayConflictError({
  conflictDay,
  conflictStart,
  conflictEnd,
  timezone,
  existingBookingName,
  onRetry,
  className,
}: MultiDayConflictErrorProps) {
  const dayDate = DateTime.fromISO(conflictDay);
  const dayLabel = dayDate.setLocale("pt-BR").toFormat("ccc dd/MM");
  const startTime = DateTime.fromISO(conflictStart, { zone: "utc" }).setZone(timezone).toFormat("HH:mm");
  const endTime = DateTime.fromISO(conflictEnd, { zone: "utc" }).setZone(timezone).toFormat("HH:mm");

  const description = existingBookingName
    ? `${dayLabel} nao esta disponivel: booking existente "${existingBookingName}" das ${startTime} as ${endTime}`
    : `${dayLabel} nao esta disponivel: booking existente das ${startTime} as ${endTime}`;

  return (
    <div className={`space-y-3 ${className ?? ""}`} role="alert" aria-live="assertive">
      <FeedbackBanner
        title="Horario indisponivel"
        description={description}
        tone="danger"
      />
      <Button variant="secondary" size="md" onClick={onRetry}>
        Atualizar horarios
      </Button>
    </div>
  );
}
