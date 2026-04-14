import { DateTime } from "luxon";
import { MultiDayBadge } from "@/components/slots/multi-day-badge";
import { AffectedDaysList } from "@/components/slots/affected-days-list";
import { Card, CardDescription } from "@/components/flow/card";
import { colors, semanticTokens } from "@/design-system";
import type { AffectedDay } from "@/components/slots/affected-days-list";

export interface MultiDaySummaryProps {
  serviceName?: string;
  professionalName?: string;
  start: string;
  end: string;
  daysAffected: AffectedDay[];
  timezone: string;
  className?: string;
}

export function MultiDaySummary({
  serviceName,
  professionalName,
  start,
  end,
  daysAffected,
  timezone,
  className,
}: MultiDaySummaryProps) {
  const startDate = DateTime.fromISO(start, { zone: "utc" }).setZone(timezone);
  const endDate = DateTime.fromISO(end, { zone: "utc" }).setZone(timezone);
  const daysCount = daysAffected.length;

  return (
    <Card
      variant="glass"
      padding="lg"
      className={`space-y-4 ${className ?? ""}`}
      style={{
        borderColor: semanticTokens.border.default,
        backgroundColor: semanticTokens.surface.glass,
      }}
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3">
        <CardDescription>Resumo do agendamento</CardDescription>
        <MultiDayBadge daysCount={daysCount} variant="compact" />
      </div>

      <div className="rounded-2xl border p-5" style={{ borderColor: semanticTokens.border.subtle, backgroundColor: semanticTokens.surface.glassSubtle }}>
        {serviceName && (
          <p className="text-lg font-semibold" style={{ color: colors.text.primary }}>
            {serviceName}
          </p>
        )}

        <div className="mt-4 space-y-1.5 text-sm font-medium" style={{ color: colors.text.soft }}>
          <p>
            Periodo:{" "}
            <span className="font-semibold" style={{ color: colors.text.primary }}>
              {startDate.setLocale("pt-BR").toFormat("ccc dd/MM HH:mm")}
            </span>
          </p>
          <p className="flex items-baseline gap-2">
            <span className="text-xl font-bold" style={{ color: colors.brand.primary }}>
              {startDate.toFormat("HH:mm")}
            </span>
            <span>{"\u2192"}</span>
            <span className="text-xl font-bold" style={{ color: colors.brand.primary }}>
              {endDate.toFormat("HH:mm")}
            </span>
          </p>
          <p>
            ({endDate.setLocale("pt-BR").toFormat("ccc dd/MM")})
          </p>
        </div>

        <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${semanticTokens.border.subtle}` }}>
          <AffectedDaysList days={daysAffected} timezone={timezone} />
        </div>

        {professionalName && (
          <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${semanticTokens.border.subtle}` }}>
            <p className="text-sm font-medium" style={{ color: colors.text.soft }}>
              Com: <span style={{ color: colors.text.primary }}>{professionalName}</span>
            </p>
            <p className="text-sm font-medium" style={{ color: colors.text.soft }}>
              Timezone: <span style={{ color: colors.text.primary }}>{timezone}</span>
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
