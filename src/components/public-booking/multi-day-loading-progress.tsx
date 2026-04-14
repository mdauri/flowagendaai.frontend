import { DateTime } from "luxon";
import { colors, semanticTokens } from "@/design-system";
import type { DayWithStatus, MultiDayDayStatus } from "@/types/multi-day";

export interface MultiDayLoadingProgressProps {
  days: DayWithStatus[];
  className?: string;
}

function StatusIcon({ status }: { status: MultiDayDayStatus }) {
  switch (status) {
    case "pending":
      return <span style={{ color: colors.text.muted }} aria-hidden="true">...</span>;
    case "checking":
      return (
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" style={{ color: colors.brand.primary }} aria-hidden="true" />
      );
    case "available":
      return <span style={{ color: semanticTokens.feedback.success.text }} aria-hidden="true">&#10003;</span>;
    case "conflict":
      return <span style={{ color: semanticTokens.feedback.danger.text }} aria-hidden="true">&#10007;</span>;
  }
}

export function MultiDayLoadingProgress({ days, className }: MultiDayLoadingProgressProps) {
  const formatDate = (date: string) => {
    return DateTime.fromISO(date).setLocale("pt-BR").toFormat("ccc dd/MM");
  };

  return (
    <div
      className={`flex items-center justify-center ${className ?? ""}`}
      role="status"
      aria-live="polite"
    >
      <div
        className="rounded-2xl border p-6 text-center"
        style={{
          backgroundColor: semanticTokens.surface.panelRaised,
          borderColor: semanticTokens.border.default,
        }}
      >
        <div className="mb-4 flex items-center justify-center gap-2">
          <div
            className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"
            style={{ color: colors.brand.primary }}
            aria-hidden="true"
          />
          <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>
            Calculando disponibilidade multi-dia...
          </p>
        </div>
        <p className="mb-3 text-xs" style={{ color: colors.text.soft }}>
          Verificando dias:
        </p>
        <div className="space-y-1.5 text-sm">
          {days.map((day) => (
            <div key={day.date} className="flex items-center gap-2">
              <StatusIcon status={day.status} />
              <span style={{ color: colors.text.primary }}>{formatDate(day.date)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
