import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { formatUtcTimeRangeInTenantTimezone } from "@/lib/date-time";
import type { DashboardSummaryBookingItem } from "@/types/dashboard";
import { DashboardStatusBadge } from "@/components/dashboard/dashboard-status-badge";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";

interface DashboardUpcomingListProps {
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

export function DashboardUpcomingList({ bookings, tenantTimezone }: DashboardUpcomingListProps) {
  if (bookings.length === 0) {
    return (
      <DashboardEmptyState
        title="Sem proximos atendimentos"
        description="Nao ha itens futuros no recorte operacional retornado pelo backend."
      />
    );
  }

  return (
    <Card variant="glass" padding="lg">
      <CardTitle>Proximos atendimentos</CardTitle>
      <CardDescription className="mt-3">
        Recorte operacional pronto para leitura rapida.
      </CardDescription>

      <ul className="mt-6 grid gap-3" aria-label="Proximos atendimentos">
        {bookings.map((booking) => {
          const customerContacts = resolveCustomerContacts(booking);

          return (
          <li
            key={booking.bookingId}
            className="rounded-[24px] border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-secondary">
                  {formatUtcTimeRangeInTenantTimezone(booking.start, booking.end, tenantTimezone)}
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {resolveCustomerName(booking.customerName)}
                </p>
                {customerContacts.length > 0 && (
                  <p className="mt-1 text-xs text-text-soft">{customerContacts.join(" • ")}</p>
                )}
                <p className="mt-1 text-sm text-text-soft">{booking.professionalName}</p>
                <p className="mt-1 text-xs text-text-soft">{booking.serviceName}</p>
              </div>

              <DashboardStatusBadge status={booking.status} />
            </div>
          </li>
          );
        })}
      </ul>
    </Card>
  );
}
