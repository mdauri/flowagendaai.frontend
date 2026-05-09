import { useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Button } from "@/components/flow/button";
import { Input } from "@/components/flow/input";
import { Select } from "@/components/flow/select";
import { Badge } from "@/components/flow/badge";
import { useBookingsQuery } from "@/hooks/use-bookings-query";
import { useBookingByIdQuery } from "@/hooks/use-booking-by-id-query";
import { formatUtcTimeRangeInTenantTimezone } from "@/lib/date-time";
import { useAuth } from "@/hooks/use-auth";
import type { BookingReadItem, BookingStatus } from "@/types/booking";
import { createPortal } from "react-dom";

function toUtcDayRange(timezone: string, dayOffset: number) {
  const base = DateTime.now().setZone(timezone).plus({ days: dayOffset });
  const from = base.startOf("day").toUTC().toISO();
  const to = base.endOf("day").set({ millisecond: 0 }).toUTC().toISO();

  return {
    from: from ?? new Date().toISOString(),
    to: to ?? new Date().toISOString(),
  };
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

function resolveCustomerName(customerName: string | null) {
  return customerName ?? "Cliente nao informado";
}

function shouldDisplayValue(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);
}

function parseDateInputToUtcRange(dateValue: string, timezone: string) {
  const date = DateTime.fromISO(dateValue, { zone: timezone });
  if (!date.isValid) {
    return null;
  }

  const from = date.startOf("day").toUTC().toISO();
  const to = date.endOf("day").set({ millisecond: 0 }).toUTC().toISO();
  if (!from || !to) return null;

  return { from, to };
}

function resolveNextBooking(items: BookingReadItem[]) {
  const now = DateTime.utc();
  return (
    items.find((item) => {
      if (item.status === "CANCELLED") return false;
      const start = DateTime.fromISO(item.start, { zone: "utc" });
      return start.isValid && start >= now;
    }) ?? null
  );
}

export function MeuDiaPage() {
  const auth = useAuth();
  const tenantTimezone = auth.tenant?.timezone ?? "UTC";

  const todayRange = useMemo(() => toUtcDayRange(tenantTimezone, 0), [tenantTimezone]);

  const [selectedDate, setSelectedDate] = useState(
    DateTime.now().setZone(tenantTimezone).toFormat("yyyy-MM-dd")
  );
  const [draftStatus, setDraftStatus] = useState<string>("");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [applied, setApplied] = useState({
    from: todayRange.from,
    to: todayRange.to,
    status: undefined as string | undefined,
    page: 1,
    pageSize: 50,
  });

  const bookingsQuery = useBookingsQuery(applied);
  const bookingByIdQuery = useBookingByIdQuery(selectedBookingId);

  useEffect(() => {
    setIsDetailsOpen(Boolean(selectedBookingId));
  }, [selectedBookingId]);

  useEffect(() => {
    if (!isDetailsOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedBookingId(null);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDetailsOpen]);

  const items = bookingsQuery.data?.items ?? [];
  const isEmpty = bookingsQuery.isSuccess && items.length === 0;
  const nextBooking = useMemo(() => resolveNextBooking(items), [items]);

  const kpis = useMemo(() => {
    const total = items.length;
    const cancelled = items.filter((item) => item.status === "CANCELLED").length;
    const estimatedValue = items.reduce((acc, item) => acc + (item.servicePrice ?? 0), 0);
    return { total, cancelled, estimatedValue };
  }, [items]);

  const statusOptions = [
    { label: "Confirmado", value: "CONFIRMED" },
    { label: "Pendente", value: "PENDING" },
    { label: "Cancelado", value: "CANCELLED" },
    { label: "Concluido", value: "COMPLETED" },
  ];

  const selectedBookingFromList = useMemo(() => {
    if (!selectedBookingId) return null;
    return items.find((item) => item.id === selectedBookingId) ?? null;
  }, [items, selectedBookingId]);

  const bookingDetails = bookingByIdQuery.data?.booking ?? selectedBookingFromList;

  function applyRangeFromPreset(dayOffset: number) {
    const nextRange = toUtcDayRange(tenantTimezone, dayOffset);
    const nextDate = DateTime.now().setZone(tenantTimezone).plus({ days: dayOffset }).toFormat("yyyy-MM-dd");
    setSelectedDate(nextDate);
    setApplied((prev) => ({
      ...prev,
      from: nextRange.from,
      to: nextRange.to,
      page: 1,
    }));
  }

  function applySelectedDate(value: string) {
    setSelectedDate(value);
    const parsed = parseDateInputToUtcRange(value, tenantTimezone);
    if (!parsed) return;
    setApplied((prev) => ({
      ...prev,
      from: parsed.from,
      to: parsed.to,
      page: 1,
    }));
  }

  function applyStatus(value: string) {
    setDraftStatus(value);
    setApplied((prev) => ({
      ...prev,
      status: value.trim() || undefined,
      page: 1,
    }));
  }

  return (
    <div className="space-y-6" aria-busy={bookingsQuery.isFetching ? "true" : "false"}>
      <header className="space-y-2">
        <h2 className="text-2xl font-black tracking-tight text-white">Meu Dia</h2>
        <CardDescription>
          Painel operacional para acompanhar os atendimentos do dia.
        </CardDescription>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <Card variant="glass" padding="sm" radiusSize="xl">
          <CardDescription>Total do dia</CardDescription>
          <CardTitle className="mt-2">{kpis.total}</CardTitle>
        </Card>
        <Card variant="glass" padding="sm" radiusSize="xl">
          <CardDescription>Valor estimado</CardDescription>
          <CardTitle className="mt-2">{formatCurrency(kpis.estimatedValue)}</CardTitle>
        </Card>
        <Card variant="glass" padding="sm" radiusSize="xl">
          <CardDescription>Cancelamentos</CardDescription>
          <CardTitle className="mt-2">{kpis.cancelled}</CardTitle>
        </Card>
      </section>

      {nextBooking ? (
        <section>
          <Card variant="premium" padding="md" radiusSize="xl">
            <CardDescription>Proximo atendimento</CardDescription>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <CardTitle className="text-2xl">
                {formatUtcTimeRangeInTenantTimezone(
                  nextBooking.start,
                  nextBooking.end,
                  tenantTimezone,
                )}
              </CardTitle>
              <Badge variant={statusVariant(nextBooking.status)}>{statusLabel(nextBooking.status)}</Badge>
            </div>
            <p className="mt-2 text-sm text-white">
              {nextBooking.serviceName} · {resolveCustomerName(nextBooking.customerName)}
            </p>
          </Card>
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-4">
        <Button type="button" variant="secondary" size="sm" onClick={() => applyRangeFromPreset(0)}>
          Hoje
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => applyRangeFromPreset(1)}>
          Amanha
        </Button>
        <Input
          type="date"
          value={selectedDate}
          onChange={(event) => applySelectedDate(event.target.value)}
          aria-label="Escolher data"
          inputSize="sm"
        />
        <Select
          value={draftStatus}
          options={statusOptions}
          placeholder="Todos os status"
          onValueChange={applyStatus}
        />
      </section>

      <section className="space-y-3">
        {bookingsQuery.isLoading ? (
          <Card variant="glass" padding="md">
            <p className="text-sm text-text-soft">Carregando agenda do dia...</p>
          </Card>
        ) : bookingsQuery.isError ? (
          <Card variant="glass" padding="md" role="alert">
            <p className="text-sm font-semibold text-white">Nao foi possivel carregar o Meu Dia</p>
            <p className="mt-1 text-sm text-text-soft">
              Verifique sua conexao e tente novamente.
            </p>
            <div className="mt-3">
              <Button variant="secondary" size="sm" onClick={() => bookingsQuery.refetch()}>
                Tentar novamente
              </Button>
            </div>
          </Card>
        ) : isEmpty ? (
          <Card variant="glass" padding="md">
            <p className="text-sm font-semibold text-white">Sem agendamentos para a data selecionada.</p>
          </Card>
        ) : (
          <ul className="grid gap-3" aria-label="Lista de atendimentos do dia">
            {items.map((item) => (
              <li key={item.id}>
                <Card variant="glass" padding="md" radiusSize="xl">
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => setSelectedBookingId(item.id)}
                    aria-label={`Ver detalhes de ${item.serviceName}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-white">
                          {formatUtcTimeRangeInTenantTimezone(item.start, item.end, tenantTimezone)}
                        </p>
                        <p className="mt-1 text-sm text-white">{item.serviceName}</p>
                        <p className="mt-1 text-sm text-text-soft">
                          {resolveCustomerName(item.customerName)}
                          {shouldDisplayValue(item.customerPhone) ? ` · ${item.customerPhone}` : ""}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-text-soft">
                          Profissional: {item.professionalName}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge>
                        <span className="text-xs text-text-soft">
                          {item.servicePrice != null ? formatCurrency(item.servicePrice) : "-"}
                        </span>
                      </div>
                    </div>
                  </button>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {isDetailsOpen && bookingDetails
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="meu-dia-booking-details-title"
            >
              <Card variant="surface" padding="lg" radiusSize="xxl" className="w-full max-w-lg border border-white/15">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle id="meu-dia-booking-details-title">Detalhe do agendamento</CardTitle>
                    <CardDescription className="mt-1">
                      Consulte as informacoes do atendimento selecionado.
                    </CardDescription>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedBookingId(null)}>
                    Fechar
                  </Button>
                </div>

                <div className="mt-6 space-y-4 text-sm text-text-soft">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em]">Horario</p>
                    <p className="mt-1 text-white">
                      {formatUtcTimeRangeInTenantTimezone(
                        bookingDetails.start,
                        bookingDetails.end,
                        tenantTimezone
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em]">Atendimento</p>
                    <p className="mt-1 text-white">{bookingDetails.serviceName}</p>
                    <p className="mt-1 text-text-soft">Profissional: {bookingDetails.professionalName}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em]">Cliente</p>
                    <p className="mt-1 text-white">{resolveCustomerName(bookingDetails.customerName)}</p>
                    {shouldDisplayValue(bookingDetails.customerPhone) ? (
                      <p className="mt-1 text-text-soft">{bookingDetails.customerPhone}</p>
                    ) : null}
                    {shouldDisplayValue(bookingDetails.customerEmail) ? (
                      <p className="mt-1 text-text-soft">{bookingDetails.customerEmail}</p>
                    ) : null}
                  </div>
                </div>
              </Card>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

