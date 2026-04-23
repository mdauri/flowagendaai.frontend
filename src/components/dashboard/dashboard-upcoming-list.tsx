import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { formatUtcTimeRangeInTenantTimezone } from "@/lib/date-time";
import type { DashboardSummaryBookingItem } from "@/types/dashboard";
import { DashboardStatusBadge } from "@/components/dashboard/dashboard-status-badge";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { DashboardBookingActionsMenu } from "@/components/dashboard/dashboard-booking-actions-menu";

interface DashboardUpcomingListProps {
  bookings: DashboardSummaryBookingItem[];
  tenantTimezone: string;
  busyBookingId?: string | null;
  onCancelBooking?: (booking: DashboardSummaryBookingItem) => void;
  onRescheduleBooking?: (booking: DashboardSummaryBookingItem) => void;
  onViewBookingDetails?: (booking: DashboardSummaryBookingItem) => void;
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

export function DashboardUpcomingList({
  bookings,
  tenantTimezone,
  busyBookingId,
  onCancelBooking,
  onRescheduleBooking,
  onViewBookingDetails,
}: DashboardUpcomingListProps) {
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
          const isEligible = booking.status === "CONFIRMED" || booking.status === "PENDING";
          const isEligibleForReschedule = booking.status === "CONFIRMED";
          const isCancelled = booking.status === "CANCELLED";
          const isCompleted = booking.status === "COMPLETED";

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

              <div className="flex flex-col items-end gap-3">
                <DashboardStatusBadge status={booking.status} />
                {onCancelBooking ? (
                  <DashboardBookingActionsMenu
                    disabled={busyBookingId === booking.bookingId}
                    onViewDetails={() => onViewBookingDetails?.(booking)}
                    onReschedule={onRescheduleBooking ? () => onRescheduleBooking(booking) : undefined}
                    onCancel={() => onCancelBooking(booking)}
                    viewDetailsDisabled={false}
                    rescheduleDisabled={!isEligibleForReschedule || busyBookingId === booking.bookingId}
                    rescheduleLabel={
                      busyBookingId === booking.bookingId
                        ? "Reagendando..."
                        : isEligibleForReschedule
                          ? "Reagendar"
                          : booking.status === "PENDING"
                            ? "Aguardando confirmacao"
                            : isCancelled
                              ? "Ja cancelado"
                              : isCompleted
                                ? "Concluido"
                                : "Indisponivel"
                    }
                    cancelDisabled={!isEligible || busyBookingId === booking.bookingId}
                    cancelLabel={
                      busyBookingId === booking.bookingId
                        ? "Cancelando..."
                        : isCancelled
                          ? "Ja cancelado"
                          : isCompleted
                            ? "Concluido"
                          : "Cancelar agendamento"
                    }
                  />
                ) : null}
              </div>
            </div>
          </li>
          );
        })}
      </ul>
    </Card>
  );
}
