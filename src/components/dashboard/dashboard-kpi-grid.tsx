import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import type { DashboardSummaryResponse } from "@/types/dashboard";

interface DashboardKpiGridProps {
  summary: DashboardSummaryResponse;
}

const kpiDefinitions = [
  {
    key: "occupancy",
    label: "Ocupacao %",
    toneClassName: "text-secondary",
  },
  {
    key: "totalBookings",
    label: "Total",
    toneClassName: "text-white",
  },
  {
    key: "confirmed",
    label: "Confirmados",
    toneClassName: "text-emerald-300",
  },
  {
    key: "pending",
    label: "Pendentes",
    toneClassName: "text-amber-300",
  },
  {
    key: "cancelled",
    label: "Cancelados",
    toneClassName: "text-rose-300",
  },
  {
    key: "completed",
    label: "Concluidos",
    toneClassName: "text-sky-300",
  },
] as const;

function resolveKpiValue(summary: DashboardSummaryResponse, key: (typeof kpiDefinitions)[number]["key"]) {
  if (key === "occupancy") {
    return `${summary.occupancy.percentage.toFixed(2)}%`;
  }

  return summary.totals[key].toString();
}

export function DashboardKpiGrid({ summary }: DashboardKpiGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {kpiDefinitions.map((item) => (
        <Card key={item.key} variant="glass" padding="md" className="h-full">
          <CardDescription>{item.label}</CardDescription>
          <CardTitle className={`mt-4 text-3xl ${item.toneClassName}`}>
            {resolveKpiValue(summary, item.key)}
          </CardTitle>
        </Card>
      ))}
    </div>
  );
}
