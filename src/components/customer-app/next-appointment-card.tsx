import { Link } from "react-router-dom";
import { DateTime } from "luxon";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/flow/button";
import type { CustomerAppBooking } from "@/services/customer-app-service";

interface NextAppointmentCardProps {
  booking: CustomerAppBooking;
  tenantSlug: string;
  timezone: string;
}

export function NextAppointmentCard({
  booking,
  tenantSlug,
  timezone,
}: NextAppointmentCardProps) {
  const start = DateTime.fromISO(booking.start, { zone: "utc" }).setZone(timezone);

  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--theme-border-accent)] bg-[linear-gradient(145deg,var(--theme-surface-elevated),var(--theme-surface-glass))] p-5 shadow-[var(--theme-shadow-card)]">
      <div className="flex items-center gap-2 text-primary">
        <CalendarDays size={18} aria-hidden="true" />
        <h2 className="text-xs font-black uppercase tracking-[0.12em]">
          Próximo compromisso
        </h2>
      </div>
      <p className="mt-4 text-2xl font-black text-[var(--theme-text-primary)]">
        {booking.serviceName || "Compromisso"}
      </p>
      <p className="mt-2 text-base font-semibold text-[var(--theme-text-primary)]">
        {start.setLocale("pt-BR").toFormat("cccc, dd 'de' LLLL")} às{" "}
        {start.toFormat("HH:mm")}
      </p>
      {booking.professionalName ? (
        <p className="mt-2 text-sm text-text-soft">
          Profissional: {booking.professionalName}
        </p>
      ) : null}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Button as={Link} to={`/c/${tenantSlug}/bookings/${booking.id}`} size="md">
          Ver detalhes
        </Button>
        <Button
          as={Link}
          to={`/c/${tenantSlug}/catalog`}
          size="md"
          variant="secondary"
        >
          Agendar novo horário
        </Button>
      </div>
    </section>
  );
}
