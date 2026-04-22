import { useMemo, useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Button } from "@/components/flow/button";
import { Input } from "@/components/flow/input";
import { Select } from "@/components/flow/select";
import { Badge } from "@/components/flow/badge";
import { useBookingsQuery } from "@/hooks/use-bookings-query";
import { useBookingByIdQuery } from "@/hooks/use-booking-by-id-query";
import { useProfessionalsQuery } from "@/hooks/use-professionals-query";
import { formatUtcTimeRangeInTenantTimezone } from "@/lib/date-time";
import { useAuth } from "@/hooks/use-auth";
import type { BookingReadItem, BookingStatus } from "@/types/booking";

function toStartOfTodayUtcIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)).toISOString();
}

function toEndOfTodayUtcIso() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)
  ).toISOString();
}

function resolveCustomerName(customerName: string | null) {
  return customerName ?? "Cliente nao informado";
}

function statusLabel(status: BookingStatus) {
  switch (status) {
    case "CONFIRMED":
      return "Confirmado";
    case "PENDING":
      return "Pendente";
    case "CANCELLED":
      return "Cancelado";
    case "COMPLETED":
      return "Concluido";
  }
}

function statusVariant(status: BookingStatus) {
  switch (status) {
    case "CONFIRMED":
      return "success";
    case "PENDING":
      return "warning";
    case "CANCELLED":
      return "danger";
    case "COMPLETED":
      return "neutral";
  }
}

export function BookingsPage() {
  const auth = useAuth();
  const professionalsQuery = useProfessionalsQuery();

  const [draftFrom, setDraftFrom] = useState(toStartOfTodayUtcIso);
  const [draftTo, setDraftTo] = useState(toEndOfTodayUtcIso);
  const [draftProfessionalId, setDraftProfessionalId] = useState<string>("");
  const [draftStatus, setDraftStatus] = useState<string>("");
  const [draftCustomer, setDraftCustomer] = useState<string>("");

  const [applied, setApplied] = useState(() => ({
    from: toStartOfTodayUtcIso(),
    to: toEndOfTodayUtcIso(),
    professionalId: undefined as string | undefined,
    status: undefined as string | undefined,
    customerName: undefined as string | undefined,
    customerPhone: undefined as string | undefined,
    page: 1,
    pageSize: 20,
  }));

  const tenantTimezone = auth.tenant?.timezone ?? "UTC";

  const bookingsQuery = useBookingsQuery(applied);

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const bookingByIdQuery = useBookingByIdQuery(selectedBookingId);

  const professionalOptions = useMemo(() => {
    const items = professionalsQuery.data?.professionals ?? [];
    return [
      { label: "Todos", value: "" },
      ...items.map((item) => ({ label: item.name, value: item.id })),
    ];
  }, [professionalsQuery.data]);

  const statusOptions = [
    { label: "Todos", value: "" },
    { label: "Confirmado", value: "CONFIRMED" },
    { label: "Pendente", value: "PENDING" },
    { label: "Cancelado", value: "CANCELLED" },
    { label: "Concluido", value: "COMPLETED" },
  ];

  function applyFilters() {
    const customer = draftCustomer.trim();
    const digits = customer.replace(/\D/g, "");
    const customerPhone = digits.length >= 6 ? digits : undefined;
    const customerName = customerPhone ? undefined : customer.length > 0 ? customer : undefined;

    setApplied((prev) => ({
      ...prev,
      from: draftFrom.trim(),
      to: draftTo.trim(),
      professionalId: draftProfessionalId.trim() || undefined,
      status: draftStatus.trim() || undefined,
      customerName,
      customerPhone,
      page: 1,
    }));
  }

  function clearFilters() {
    const from = toStartOfTodayUtcIso();
    const to = toEndOfTodayUtcIso();

    setDraftFrom(from);
    setDraftTo(to);
    setDraftProfessionalId("");
    setDraftStatus("");
    setDraftCustomer("");
    setSelectedBookingId(null);

    setApplied({
      from,
      to,
      professionalId: undefined,
      status: undefined,
      customerName: undefined,
      customerPhone: undefined,
      page: 1,
      pageSize: 20,
    });
  }

  function goToPage(nextPage: number) {
    setApplied((prev) => ({ ...prev, page: nextPage }));
  }

  const totalPages = Math.max(1, Math.ceil((bookingsQuery.data?.total ?? 0) / applied.pageSize));
  const canGoPrev = applied.page > 1;
  const canGoNext = applied.page < totalPages;

  return (
    <div className="space-y-6">
      <Card variant="glass" padding="lg">
        <div>
          <CardTitle>Bookings</CardTitle>
          <CardDescription className="mt-2">Consulta operacional</CardDescription>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="grid gap-2 text-xs font-semibold text-text-soft">
            De
            <Input
              value={draftFrom}
              onChange={(event) => setDraftFrom(event.target.value)}
              placeholder="2026-04-22T00:00:00.000Z"
            />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-text-soft">
            Até
            <Input
              value={draftTo}
              onChange={(event) => setDraftTo(event.target.value)}
              placeholder="2026-04-22T23:59:59.999Z"
            />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-text-soft">
            Profissional
            <Select
              value={draftProfessionalId}
              onValueChange={setDraftProfessionalId}
              options={professionalOptions}
              placeholder="Selecione"
              disabled={professionalsQuery.isLoading}
            />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-text-soft">
            Status
            <Select
              value={draftStatus}
              onValueChange={setDraftStatus}
              options={statusOptions}
              placeholder="Todos"
            />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-text-soft">
            Cliente
            <Input
              value={draftCustomer}
              onChange={(event) => setDraftCustomer(event.target.value)}
              placeholder="Nome ou telefone"
              type="search"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  applyFilters();
                }
              }}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="md" onClick={applyFilters}>
            Atualizar
          </Button>
          <Button variant="ghost" size="md" onClick={clearFilters}>
            Limpar filtros
          </Button>
          <div className="ml-auto text-xs text-text-soft">
            Timezone: <span className="font-medium text-white">{tenantTimezone}</span>
          </div>
        </div>
      </Card>

      <Card variant="glass" padding="lg">
        <div className="flex items-end justify-between gap-4">
          <div>
            <CardTitle>Resultados</CardTitle>
            <CardDescription className="mt-2">
              Ordenado por data/hora (start) e paginado.
            </CardDescription>
          </div>
          <div className="text-xs text-text-soft">
            Página <span className="font-medium text-white">{applied.page}</span> de{" "}
            <span className="font-medium text-white">{totalPages}</span>
          </div>
        </div>

        <div className="mt-6" aria-busy={bookingsQuery.isFetching ? "true" : "false"} aria-label="Carregando bookings">
          {bookingsQuery.isLoading ? (
            <p className="text-sm text-text-soft">Carregando...</p>
          ) : bookingsQuery.isError ? (
            <div role="alert" className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Nao foi possivel carregar bookings</p>
              <p className="mt-1 text-xs text-text-soft">Verifique sua conexao e tente novamente.</p>
              <div className="mt-3">
                <Button variant="secondary" size="sm" onClick={() => bookingsQuery.refetch()}>
                  Tentar novamente
                </Button>
              </div>
            </div>
          ) : (bookingsQuery.data?.items ?? []).length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Nenhum booking encontrado</p>
              <p className="mt-1 text-xs text-text-soft">
                Ajuste o periodo ou remova filtros para ver mais resultados.
              </p>
              <div className="mt-3">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              </div>
            </div>
          ) : (
            <ul className="grid gap-3" aria-label="Lista de bookings">
              {bookingsQuery.data?.items.map((item: BookingReadItem) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="w-full rounded-3xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
                    onClick={() => setSelectedBookingId(item.id)}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-secondary">
                        {formatUtcTimeRangeInTenantTimezone(item.start, item.end, tenantTimezone)}
                      </div>
                      <Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge>
                    </div>
                    <div className="mt-2">
                      <p className="text-base font-semibold text-white">{resolveCustomerName(item.customerName)}</p>
                      {item.customerPhone ? (
                        <p className="mt-1 text-xs text-text-soft">{item.customerPhone}</p>
                      ) : null}
                      <p className="mt-1 text-sm text-text-soft">
                        {item.professionalName} • {item.serviceName}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button variant="ghost" size="md" onClick={() => goToPage(applied.page - 1)} disabled={!canGoPrev}>
            Anterior
          </Button>
          <div className="text-xs text-text-soft">
            Total: <span className="font-medium text-white">{bookingsQuery.data?.total ?? 0}</span>
          </div>
          <Button variant="ghost" size="md" onClick={() => goToPage(applied.page + 1)} disabled={!canGoNext}>
            Proxima
          </Button>
        </div>
      </Card>

      {selectedBookingId ? (
        <Card variant="glass" padding="lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Detalhe do booking</CardTitle>
              <CardDescription className="mt-2">ID: {selectedBookingId}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedBookingId(null)}>
              Fechar
            </Button>
          </div>

          <div className="mt-6">
            {bookingByIdQuery.isLoading ? (
              <p className="text-sm text-text-soft">Carregando detalhe...</p>
            ) : bookingByIdQuery.isError ? (
              <div role="alert" className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Nao foi possivel carregar o detalhe</p>
                <div className="mt-3">
                  <Button variant="secondary" size="sm" onClick={() => bookingByIdQuery.refetch()}>
                    Tentar novamente
                  </Button>
                </div>
              </div>
            ) : bookingByIdQuery.data ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-text-soft">Resumo</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Badge variant={statusVariant(bookingByIdQuery.data.booking.status)}>
                      {statusLabel(bookingByIdQuery.data.booking.status)}
                    </Badge>
                    <span className="text-sm font-semibold text-secondary">
                      {formatUtcTimeRangeInTenantTimezone(
                        bookingByIdQuery.data.booking.start,
                        bookingByIdQuery.data.booking.end,
                        tenantTimezone
                      )}
                    </span>
                  </div>
                  {bookingByIdQuery.data.booking.cancelledAt ? (
                    <p className="mt-2 text-xs text-text-soft">
                      Cancelado em {new Date(bookingByIdQuery.data.booking.cancelledAt).toISOString()}
                    </p>
                  ) : null}
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-text-soft">Profissional e servico</p>
                  <p className="mt-3 text-sm font-semibold text-white">
                    {bookingByIdQuery.data.booking.professionalName}
                  </p>
                  <p className="mt-1 text-sm text-text-soft">{bookingByIdQuery.data.booking.serviceName}</p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-text-soft">Cliente</p>
                  <p className="mt-3 text-sm font-semibold text-white">
                    {resolveCustomerName(bookingByIdQuery.data.booking.customerName)}
                  </p>
                  {bookingByIdQuery.data.booking.customerPhone ? (
                    <p className="mt-1 text-sm text-text-soft">{bookingByIdQuery.data.booking.customerPhone}</p>
                  ) : null}
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-text-soft">Metadados</p>
                  <p className="mt-3 text-xs text-text-soft">
                    createdAt:{" "}
                    <span className="font-medium text-white">{bookingByIdQuery.data.booking.createdAt}</span>
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
