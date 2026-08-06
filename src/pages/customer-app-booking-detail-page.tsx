import { Link, useParams } from "react-router";
import { DateTime } from "luxon";
import { Button } from "@/components/flow/button";
import { getCustomerAppSession } from "@/session/customer-app-session-storage";
import { usePublicCustomerAppConfigQuery } from "@/hooks/use-public-customer-app-config-query";
import { useCustomerAppBookingDetailQuery } from "@/hooks/use-customer-app-booking-detail-query";
import { Loader2 } from "lucide-react";

export function CustomerAppBookingDetailPage() {
  const { slug, bookingId } = useParams<{ slug: string; bookingId: string }>();
  const configQuery = usePublicCustomerAppConfigQuery(slug);
  const sessionToken = slug ? getCustomerAppSession(slug)?.token ?? null : null;
  const bookingQuery = useCustomerAppBookingDetailQuery(slug, bookingId, sessionToken);

  if (configQuery.isLoading || bookingQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg-base) px-4">
        <div className="flex items-center gap-2 text-sm text-text-soft">
          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          Carregando compromisso...
        </div>
      </div>
    );
  }

  if (configQuery.isError || !configQuery.data || bookingQuery.isError || !bookingQuery.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg-base) px-4">
        <div className="max-w-md rounded-2xl border border-[rgba(248,113,113,0.28)] bg-[var(--theme-surface-glass)] p-6 text-center">
          <h1 className="text-xl font-bold text-[var(--theme-text-primary)]">
            Nao foi possivel abrir o compromisso
          </h1>
          <p className="mt-2 text-sm text-text-soft">
            Verifique se este aparelho ainda esta vinculado ao app do cliente.
          </p>
        </div>
      </div>
    );
  }

  const { tenant } = configQuery.data;
  const { booking } = bookingQuery.data;
  const start = DateTime.fromISO(booking.start, { zone: "utc" }).setZone(tenant.timezone);
  const end = DateTime.fromISO(booking.end, { zone: "utc" }).setZone(tenant.timezone);

  return (
    <div className="min-h-screen bg-(--bg-base) px-4 py-6">
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <Button as={Link} to={`/c/${tenant.slug}`} variant="ghost" size="md">
          Voltar ao app do cliente
        </Button>

        <section className="rounded-3xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-6 shadow-[0_18px_45px_rgba(52,42,31,0.10)] backdrop-blur-sm">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">Compromisso</p>
          <h1 className="mt-2 text-2xl font-black text-[var(--theme-text-primary)]">
            {booking.serviceName || "Servico"}
          </h1>
          <p className="mt-2 text-sm text-text-soft">
            {booking.professionalName || "Profissional nao informado"}
          </p>

          <div className="mt-5 rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-elevated)] p-4 text-sm text-text-soft">
            <p className="font-semibold text-[var(--theme-text-primary)]">
              {start.setLocale("pt-BR").toFormat("cccc, dd 'de' LLLL")}
            </p>
            <p className="mt-1">
              {start.toFormat("HH:mm")} - {end.toFormat("HH:mm")}
            </p>
            <p className="mt-3">Status: {booking.status}</p>
            {booking.customerEmail ? <p className="mt-1">E-mail: {booking.customerEmail}</p> : null}
            {booking.customerPhone ? <p className="mt-1">WhatsApp: {booking.customerPhone}</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
