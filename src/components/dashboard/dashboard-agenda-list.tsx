import { Card, CardTitle } from "@/components/flow/card";
import { formatUtcTimeRangeInTenantTimezone } from "@/lib/date-time";
import type { DashboardSummaryBookingItem } from "@/types/dashboard";
import { DashboardStatusBadge } from "@/components/dashboard/dashboard-status-badge";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { DashboardBookingActionsMenu } from "@/components/dashboard/dashboard-booking-actions-menu";

interface DashboardAgendaListProps {
  bookings: DashboardSummaryBookingItem[];
  tenantTimezone: string;
  busyBookingId?: string | null;
  onCancelBooking?: (booking: DashboardSummaryBookingItem) => void;
  onRescheduleBooking?: (booking: DashboardSummaryBookingItem) => void;
  onViewBookingDetails?: (booking: DashboardSummaryBookingItem) => void;
}

function resolveCustomerName(customerName: string | null) {
  return customerName ?? "Cliente sem nome";
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

export function DashboardAgendaList({
  bookings,
  tenantTimezone,
  busyBookingId,
  onCancelBooking,
  onRescheduleBooking,
  onViewBookingDetails,
}: DashboardAgendaListProps) {
  if (bookings.length === 0) {
    return (
      <DashboardEmptyState
        title="Nenhum agendamento hoje."
        description=""
      />
    );
  }

  return (
    <Card variant="glass" padding="lg">
      <CardTitle>Agenda do dia</CardTitle>

      <ul className="mt-5 grid gap-4" aria-label="Agenda do dia">
        {bookings.map((booking) => {
          const customerContacts = resolveCustomerContacts(booking);
          const isEligible = booking.status === "CONFIRMED" || booking.status === "PENDING";
          const isEligibleForReschedule = booking.status === "CONFIRMED";
          const isCancelled = booking.status === "CANCELLED";
          const isCompleted = booking.status === "COMPLETED";

          return (
          <li
            key={booking.bookingId}
            className="grid gap-4 rounded-[28px] border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-5 xl:grid-cols-[11rem_minmax(0,1fr)_12rem_auto]"
          >
            <div className="text-sm font-semibold text-secondary">
              {formatUtcTimeRangeInTenantTimezone(booking.start, booking.end, tenantTimezone)}
            </div>

            <div>
              <p className="text-base font-semibold text-[var(--theme-text-primary)]">
                {resolveCustomerName(booking.customerName)}
              </p>
              {customerContacts.length > 0 && (
                <p className="mt-1 text-xs text-text-soft">{customerContacts.join(" • ")}</p>
              )}
              <p className="mt-1 text-sm text-text-soft">{booking.serviceName}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--theme-text-primary)]">{booking.professionalName}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-text-soft">
                {tenantTimezone}
              </p>
            </div>

            <div className="xl:justify-self-end">
              <div className="flex flex-col items-start gap-3 xl:items-end">
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
