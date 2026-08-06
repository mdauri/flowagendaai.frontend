import { Link } from "react-router";
import { DateTime } from "luxon";
import { ChevronRight, Loader2 } from "lucide-react";
import type { CustomerAppBooking } from "@/services/customer-app-service";

interface CustomerAppointmentsSectionProps {
  tenantSlug: string;
  timezone: string;
  hasSession: boolean;
  bootstrapState: "idle" | "loading" | "error";
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  bookings: CustomerAppBooking[];
}

export function CustomerAppointmentsSection({
  tenantSlug,
  timezone,
  hasSession,
  bootstrapState,
  isLoading,
  isError,
  isSuccess,
  bookings,
}: CustomerAppointmentsSectionProps) {
  return (
    <section className="rounded-3xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-5 backdrop-blur-sm">
      <h2 className="text-lg font-bold text-[var(--theme-text-primary)]">
        Meus compromissos
      </h2>

      {bootstrapState === "loading" ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-text-soft" role="status">
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          Vinculando seus compromissos...
        </div>
      ) : null}

      {bootstrapState === "error" ? (
        <p className="mt-3 text-sm leading-6 text-[var(--theme-danger-text)]">
          Não foi possível vincular seus compromissos por este link. Abra novamente
          o link recebido.
        </p>
      ) : null}

      {!hasSession ? (
        <div className="mt-4 rounded-2xl border border-dashed border-[var(--theme-border-subtle)] px-4 py-5 text-sm leading-6 text-text-soft">
          Seus compromissos aparecem aqui depois que você agenda ou abre um link de
          lembrete neste aparelho.
        </div>
      ) : null}

      {hasSession && isLoading ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-text-soft" role="status">
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          Carregando seus compromissos...
        </div>
      ) : null}

      {hasSession && isError ? (
        <p className="mt-3 text-sm leading-6 text-[var(--theme-danger-text)]">
          Não foi possível carregar seus compromissos agora.
        </p>
      ) : null}

      {hasSession && isSuccess && bookings.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-[var(--theme-border-subtle)] px-4 py-5 text-sm text-text-soft">
          Nenhum compromisso futuro.
        </div>
      ) : null}

      {hasSession && isSuccess && bookings.length > 0 ? (
        <div className="mt-4 space-y-3">
          {bookings.map((booking) => {
            const start = DateTime.fromISO(booking.start, { zone: "utc" }).setZone(
              timezone,
            );
            const end = DateTime.fromISO(booking.end, { zone: "utc" }).setZone(
              timezone,
            );
            const serviceName = booking.serviceName || "Compromisso";
            const dateLabel = start
              .setLocale("pt-BR")
              .toFormat("dd/LL/yyyy 'às' HH:mm");

            return (
              <Link
                key={booking.id}
                to={`/c/${tenantSlug}/bookings/${booking.id}`}
                aria-label={`${serviceName}, ${dateLabel}. Ver detalhes`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-elevated)] p-4 transition hover:border-[var(--theme-border-accent)] focus-visible:outline-none focus-visible:[box-shadow:var(--theme-focus-ring)]"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--theme-text-primary)]">
                    {serviceName}
                  </p>
                  {booking.professionalName ? (
                    <p className="mt-1 text-sm text-text-soft">
                      {booking.professionalName}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm text-[var(--theme-text-primary)]">
                    {dateLabel} - {end.toFormat("HH:mm")}
                  </p>
                </div>
                <ChevronRight
                  size={18}
                  className="shrink-0 text-text-muted"
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
