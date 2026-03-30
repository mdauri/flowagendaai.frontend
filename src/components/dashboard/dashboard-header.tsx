import { DateTime } from "luxon";
import { Badge } from "@/components/flow/badge";
import { SectionHeading } from "@/components/flow/section-heading";

interface DashboardHeaderProps {
  date: string;
  tenantTimezone: string;
}

function formatDashboardDate(date: string, tenantTimezone: string) {
  return DateTime.fromISO(date, { zone: tenantTimezone }).setLocale("pt-BR").toFormat("dd 'de' LLLL 'de' yyyy");
}

function isTodayInTenant(date: string, tenantTimezone: string) {
  return DateTime.now().setZone(tenantTimezone).toISODate() === date;
}

export function DashboardHeader({ date, tenantTimezone }: DashboardHeaderProps) {
  const isToday = isTodayInTenant(date, tenantTimezone);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <SectionHeading
        eyebrow="Dashboard Operacional"
        title="Dashboard operacional"
        description={`Baseado em ${formatDashboardDate(date, tenantTimezone)} no timezone ${tenantTimezone}.`}
      />

      <div className="flex flex-wrap items-center gap-3">
        {isToday ? <Badge variant="info">Hoje</Badge> : null}
        <Badge variant="subtle">{tenantTimezone}</Badge>
      </div>
    </div>
  );
}
