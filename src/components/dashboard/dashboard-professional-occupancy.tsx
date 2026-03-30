import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import type { DashboardProfessionalOccupancyItem } from "@/types/dashboard";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";

interface DashboardProfessionalOccupancyProps {
  items: DashboardProfessionalOccupancyItem[];
}

function getProgressWidth(percentage: number) {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  return `${clampedPercentage}%`;
}

export function DashboardProfessionalOccupancy({ items }: DashboardProfessionalOccupancyProps) {
  if (items.length === 0) {
    return (
      <DashboardEmptyState
        title="Sem ocupacao por profissional"
        description="Nenhum profissional retornou ocupacao para esta data."
      />
    );
  }

  return (
    <Card variant="glass" padding="lg">
      <CardTitle>Ocupacao por profissional</CardTitle>
      <CardDescription className="mt-3">
        Lista exibida na ordem entregue pelo backend.
      </CardDescription>

      <ul className="mt-6 grid gap-4" aria-label="Ocupacao por profissional">
        {items.map((item) => (
          <li
            key={item.professionalId}
            className="rounded-[24px] border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{item.professionalName}</p>
                <p className="mt-1 text-sm text-text-soft">
                  {item.bookedMinutes} min ocupados de {item.availableMinutes} min disponiveis
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-text-soft">
                  {item.totalBookings} agendamentos
                </p>
              </div>
              <p className="text-sm font-semibold text-secondary">{item.percentage.toFixed(2)}%</p>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-secondary"
                style={{ width: getProgressWidth(item.percentage) }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
