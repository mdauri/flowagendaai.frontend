import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { formatUtcTimeRangeInTenantTimezone } from "@/lib/date-time";
import type { DashboardSummaryBookingItem } from "@/types/dashboard";
import { DashboardStatusBadge } from "@/components/dashboard/dashboard-status-badge";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";

interface DashboardAgendaListProps {
  bookings: DashboardSummaryBookingItem[];
  tenantTimezone: string;
}

function resolveCustomerName(customerName: string | null) {
  return customerName ?? "Cliente nao informado";
}

function resolveCustomerContacts(booking: DashboardSummaryBookingItem): string[] {
  const contacts: string[] = [];

  if (booking.customerEmail) {
    contacts.push(booking.customerEmail);
  }

  if (booking.customerPhone) {
    contacts.push(booking.customerPhone);
  }

  return contacts;
}

export function DashboardAgendaList({ bookings, tenantTimezone }: DashboardAgendaListProps) {
  if (bookings.length === 0) {
    return (
      <DashboardEmptyState
        title="Nenhum agendamento"
        description="Nao ha agendamentos para a data consultada."
      />
    );
  }

  return (
    <Card variant="glass" padding="lg">
      <div className="flex items-end justify-between gap-4">
        <div>
          <CardTitle>Agenda do dia</CardTitle>
          <CardDescription className="mt-3">
            Ordem preservada exatamente como retornada pelo backend.
          </CardDescription>
        </div>
      </div>

      <ul className="mt-8 grid gap-4" aria-label="Agenda do dia">
        {bookings.map((booking) => {
          const customerContacts = resolveCustomerContacts(booking);

          return (
          <li
            key={booking.bookingId}
            className="grid gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 xl:grid-cols-[11rem_minmax(0,1fr)_12rem_auto]"
          >
            <div className="text-sm font-semibold text-secondary">
              {formatUtcTimeRangeInTenantTimezone(booking.start, booking.end, tenantTimezone)}
            </div>

            <div>
              <p className="text-base font-semibold text-white">
                {resolveCustomerName(booking.customerName)}
              </p>
              {customerContacts.length > 0 && (
                <p className="mt-1 text-xs text-text-soft">{customerContacts.join(" • ")}</p>
              )}
              <p className="mt-1 text-sm text-text-soft">{booking.serviceName}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-white">{booking.professionalName}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-text-soft">
                {tenantTimezone}
              </p>
            </div>

            <div className="xl:justify-self-end">
              <DashboardStatusBadge status={booking.status} />
            </div>
          </li>
          );
        })}
      </ul>
    </Card>
  );
}
