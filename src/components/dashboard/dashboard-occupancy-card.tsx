import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { colors } from "@/design-system";
import type { DashboardSummaryOccupancy } from "@/types/dashboard";

interface DashboardOccupancyCardProps {
  occupancy: DashboardSummaryOccupancy;
}

function resolveInsight(percentage: number) {
  if (percentage < 40) {
    return "Dia leve";
  }

  if (percentage < 75) {
    return "Capacidade equilibrada";
  }

  return "Agenda pressionada";
}

function getProgressWidth(percentage: number) {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  return `${clampedPercentage}%`;
}

export function DashboardOccupancyCard({ occupancy }: DashboardOccupancyCardProps) {
  return (
    <Card variant="premium" padding="lg" className="h-full">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-text-soft">
        Ocupacao do dia
      </p>
      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-5xl font-black tracking-tight text-white md:text-6xl">
            {occupancy.percentage.toFixed(2)}%
          </p>
          <CardDescription className="mt-3">{resolveInsight(occupancy.percentage)}</CardDescription>
        </div>
      </div>

      <div
        className="mt-8 h-3 overflow-hidden rounded-full"
        style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
        aria-label={`Ocupacao do dia em ${occupancy.percentage.toFixed(2)} por cento`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number(occupancy.percentage.toFixed(2))}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: getProgressWidth(occupancy.percentage),
            background: `linear-gradient(90deg, ${colors.brand.primary} 0%, ${colors.brand.secondary} 100%)`,
          }}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <CardTitle className="text-lg">{occupancy.bookedMinutes} min</CardTitle>
          <CardDescription className="mt-2">Tempo ocupado</CardDescription>
        </div>
        <div>
          <CardTitle className="text-lg">{occupancy.availableMinutes} min</CardTitle>
          <CardDescription className="mt-2">Tempo disponivel</CardDescription>
        </div>
      </div>
    </Card>
  );
}
