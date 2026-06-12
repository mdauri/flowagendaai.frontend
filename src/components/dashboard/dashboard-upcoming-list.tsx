import { Card, CardTitle } from "@/components/flow/card";
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
  onMarkDepositPaid?: (booking: DashboardSummaryBookingItem) => void;
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

export function DashboardUpcomingList({
  bookings,
  tenantTimezone,
  busyBookingId,
  onCancelBooking,
  onRescheduleBooking,
  onViewBookingDetails,
  onMarkDepositPaid,
}: DashboardUpcomingListProps) {
  if (bookings.length === 0) {
    return (
      <DashboardEmptyState
        title="Sem proximos atendimentos."
      />
    );
  }

  return (
    <Card variant="glass" padding="lg" className="min-w-0">
      <CardTitle>Proximos atendimentos</CardTitle>

      <ul className="mt-5 grid gap-3" aria-label="Proximos atendimentos">
        {bookings.map((booking) => {
          const customerContacts = resolveCustomerContacts(booking);
          const canMarkDepositPaid = booking.status === "AWAITING_DEPOSIT";
          const isEligible = booking.status === "CONFIRMED" || booking.status === "PENDING";
          const isEligibleForReschedule = booking.status === "CONFIRMED";
          const isCancelled = booking.status === "CANCELLED";
          const isCompleted = booking.status === "COMPLETED";

          return (
          <li
            key={booking.bookingId}
            className="min-w-0 rounded-[24px] border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-secondary">
                  {formatUtcTimeRangeInTenantTimezone(booking.start, booking.end, tenantTimezone)}
                </p>
                <p className="mt-2 break-words text-sm font-semibold text-[var(--theme-text-primary)]">
                  {resolveCustomerName(booking.customerName)}
                </p>
                {customerContacts.length > 0 && (
                  <p className="mt-1 break-words text-xs text-text-soft">
                    {customerContacts.join(" • ")}
                  </p>
                )}
                <p className="mt-1 break-words text-sm text-text-soft">{booking.professionalName}</p>
                <p className="mt-1 break-words text-xs text-text-soft">{booking.serviceName}</p>
              </div>

              <div className="flex flex-col items-end gap-3">
                <DashboardStatusBadge status={booking.status} />
                {onCancelBooking ? (
                  <DashboardBookingActionsMenu
                  disabled={busyBookingId === booking.bookingId}
                  onViewDetails={() => onViewBookingDetails?.(booking)}
                  onMarkDepositPaid={
                    onMarkDepositPaid && canMarkDepositPaid
                      ? () => onMarkDepositPaid(booking)
                      : undefined
                  }
                  onReschedule={onRescheduleBooking ? () => onRescheduleBooking(booking) : undefined}
                  onCancel={() => onCancelBooking(booking)}
                  viewDetailsDisabled={false}
                  markDepositPaidDisabled={busyBookingId === booking.bookingId}
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
