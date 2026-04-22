import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/flow/button";
import { CardDescription, CardTitle } from "@/components/flow/card";
import type { BookingReadItem } from "@/types/booking";
import { formatUtcTimeRangeInTenantTimezone } from "@/lib/date-time";
import { DashboardStatusBadge } from "@/components/dashboard/dashboard-status-badge";
import type { DashboardSummaryBookingItem } from "@/types/dashboard";

interface DashboardBookingDetailsDialogProps {
  isOpen: boolean;
  booking: BookingReadItem | null;
  fallbackBooking?: DashboardSummaryBookingItem | null;
  tenantTimezone: string;
  isLoading?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onRetry?: () => void;
}

function resolveCustomerName(customerName: string | null) {
  return customerName ?? "Cliente nao informado";
}

export function DashboardBookingDetailsDialog({
  isOpen,
  booking,
  fallbackBooking = null,
  tenantTimezone,
  isLoading = false,
  errorMessage,
  onClose,
  onRetry,
}: DashboardBookingDetailsDialogProps) {
  const dialogRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    const firstButton = dialogRef.current?.querySelector<HTMLButtonElement>('button');
    firstButton?.focus();
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (!dialogRef.current) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !dialogRef.current.contains(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center overflow-y-auto bg-black/80 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dashboard-booking-details-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="relative z-[1201] w-full max-w-lg max-h-[calc(100vh-3rem)] overflow-y-auto rounded-[28px] border border-white/30 bg-[#141416] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle id="dashboard-booking-details-title">Detalhes do agendamento</CardTitle>
            <CardDescription className="mt-2">Consulta operacional da agenda real.</CardDescription>
          </div>
          <Button type="button" size="sm" variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>

        {isLoading && !booking && !fallbackBooking ? (
          <p className="mt-6 text-sm text-text-soft">Carregando detalhes...</p>
        ) : errorMessage && !booking && !fallbackBooking ? (
          <div className="mt-6 rounded-[20px] border border-red-400/30 bg-red-950/20 p-4">
            <p className="text-sm font-semibold text-white">Nao foi possivel carregar o detalhe.</p>
            <p className="mt-1 text-xs text-text-soft">{errorMessage}</p>
            {onRetry ? (
              <div className="mt-3">
                <Button type="button" size="sm" variant="secondary" onClick={onRetry}>
                  Tentar novamente
                </Button>
              </div>
            ) : null}
          </div>
        ) : booking || fallbackBooking ? (
          <div className="mt-6 grid gap-4">
            <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-text-soft">Resumo</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <DashboardStatusBadge status={booking?.status ?? fallbackBooking?.status ?? "PENDING"} />
                <p className="text-sm font-semibold text-secondary">
                  {formatUtcTimeRangeInTenantTimezone(
                    booking?.start ?? fallbackBooking?.start ?? "",
                    booking?.end ?? fallbackBooking?.end ?? "",
                    tenantTimezone
                  )}
                </p>
              </div>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-text-soft">Cliente</p>
              <p className="mt-2 text-sm font-semibold text-white">
                {resolveCustomerName(booking?.customerName ?? fallbackBooking?.customerName ?? null)}
              </p>
              {(booking?.customerPhone ?? fallbackBooking?.customerPhone) ? (
                <p className="mt-1 text-sm text-text-soft">
                  {booking?.customerPhone ?? fallbackBooking?.customerPhone}
                </p>
              ) : null}
            </div>

            <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-text-soft">Atendimento</p>
              <p className="mt-2 text-sm font-semibold text-white">
                {booking?.professionalName ?? fallbackBooking?.professionalName ?? "Nao informado"}
              </p>
              <p className="mt-1 text-sm text-text-soft">
                {booking?.serviceName ?? fallbackBooking?.serviceName ?? "Nao informado"}
              </p>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-text-soft">Metadados</p>
              {booking?.createdAt ? (
                <p className="mt-2 text-xs text-text-soft">
                  Criado em <span className="font-semibold text-white">{booking.createdAt}</span>
                </p>
              ) : null}
              {booking?.cancelledAt ? (
                <p className="mt-1 text-xs text-text-soft">
                  Cancelado em <span className="font-semibold text-white">{booking.cancelledAt}</span>
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
