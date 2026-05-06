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

function safeFormatUtcTimeRangeInTenantTimezone(
  start: string | null | undefined,
  end: string | null | undefined,
  timezone: string
): string {
  if (!start || !end) {
    return "-";
  }

  const startDateTime = DateTime.fromISO(start, { zone: "utc" }).setZone(timezone);
  const endDateTime = DateTime.fromISO(end, { zone: "utc" }).setZone(timezone);

  if (!startDateTime.isValid || !endDateTime.isValid) {
    return "-";
  }

  return `${startDateTime.toFormat("HH:mm")} - ${endDateTime.toFormat("HH:mm")}`;
}

function isValidIsoUtc(value: string | null | undefined): value is string {
  if (!value) return false;
  return DateTime.fromISO(value, { zone: "utc" }).isValid;
}

function toStartOfTodayUtcIso(timezone: string) {
  const local = DateTime.now().setZone(timezone).startOf("day");
  return local.toUTC().toISO();
}

function toEndOfTodayUtcIso(timezone: string) {
  const local = DateTime.now()
    .setZone(timezone)
    .endOf("day")
    .set({ millisecond: 0 }); // UI pede 23:59:59 (sem ms)
  return local.toUTC().toISO();
}

function resolveCustomerName(customerName: string | null) {
  return customerName ?? "Cliente nao informado";
}

function shouldDisplayValue(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
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

function isRangeInvalid(from: string, to: string) {
  const fromTs = new Date(from).getTime();
  const toTs = new Date(to).getTime();
  return Number.isFinite(fromTs) && Number.isFinite(toTs) ? fromTs > toTs : false;
}

export function MinhaAgendaPage() {
  const auth = useAuth();
  const tenantTimezone = auth.tenant?.timezone ?? "UTC";

  const [draftFromText, setDraftFromText] = useState(() =>
    DateTime.fromISO(toStartOfTodayUtcIso(tenantTimezone) ?? "", { zone: "utc" })
      .setZone(tenantTimezone)
      .toFormat("dd/MM/yyyy HH:mm:ss")
  );
  const [draftToText, setDraftToText] = useState(() =>
    DateTime.fromISO(toEndOfTodayUtcIso(tenantTimezone) ?? "", { zone: "utc" })
      .setZone(tenantTimezone)
      .toFormat("dd/MM/yyyy HH:mm:ss")
  );
  const [draftStatus, setDraftStatus] = useState<string>("");

  const [validationError, setValidationError] = useState<string | null>(null);

  const [applied, setApplied] = useState(() => ({
    from: toStartOfTodayUtcIso(tenantTimezone) ?? new Date().toISOString(),
    to: toEndOfTodayUtcIso(tenantTimezone) ?? new Date().toISOString(),
    status: undefined as string | undefined,
    page: 1,
    pageSize: 20,
  }));

  const bookingsQuery = useBookingsQuery(applied);

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const bookingByIdQuery = useBookingByIdQuery(selectedBookingId);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    setIsDetailsOpen(Boolean(selectedBookingId));
  }, [selectedBookingId]);

  useEffect(() => {
    if (!isDetailsOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedBookingId(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDetailsOpen]);

  const statusOptions = [
    { label: "Todos", value: "" },
    { label: "Confirmado", value: "CONFIRMED" },
    { label: "Pendente", value: "PENDING" },
    { label: "Cancelado", value: "CANCELLED" },
    { label: "Concluido", value: "COMPLETED" },
  ];

  const items = bookingsQuery.data?.items ?? [];
  const isEmpty = bookingsQuery.isSuccess && items.length === 0;

  const rangeLabel = useMemo(() => {
    const from = DateTime.fromISO(applied.from, { zone: "utc" })
      .setZone(tenantTimezone)
      .toFormat("dd/MM/yyyy HH:mm:ss");
    const to = DateTime.fromISO(applied.to, { zone: "utc" })
      .setZone(tenantTimezone)
      .toFormat("dd/MM/yyyy HH:mm:ss");

    return `Periodo: ${from} até ${to}`;
  }, [applied.from, applied.to, tenantTimezone]);

  function applyFilters() {
    setValidationError(null);

    const fromLocal = DateTime.fromFormat(draftFromText.trim(), "dd/MM/yyyy HH:mm:ss", {
      zone: tenantTimezone,
    });
    const toLocal = DateTime.fromFormat(draftToText.trim(), "dd/MM/yyyy HH:mm:ss", {
      zone: tenantTimezone,
    });

    if (!fromLocal.isValid) {
      setValidationError("Data invalida em 'De'. Use o formato dd/mm/aaaa HH:mm:ss.");
      return;
    }

    if (!toLocal.isValid) {
      setValidationError("Data invalida em 'Ate'. Use o formato dd/mm/aaaa HH:mm:ss.");
      return;
    }

    const from = fromLocal.toUTC().toISO();
    const to = toLocal.toUTC().toISO();

    if (!from || !to) {
      setValidationError("Periodo invalido. Verifique os valores informados.");
      return;
    }

    if (isRangeInvalid(from, to)) {
      setValidationError("Periodo invalido. O campo 'De' nao pode ser maior que 'Ate'.");
      return;
    }

    setApplied((prev) => ({
      ...prev,
      from,
      to,
      status: draftStatus.trim() || undefined,
      page: 1,
    }));
  }

  function clearFilters() {
    const from = toStartOfTodayUtcIso(tenantTimezone) ?? new Date().toISOString();
    const to = toEndOfTodayUtcIso(tenantTimezone) ?? new Date().toISOString();

    setDraftFromText(
      DateTime.fromISO(from, { zone: "utc" }).setZone(tenantTimezone).toFormat("dd/MM/yyyy HH:mm:ss")
    );
    setDraftToText(
      DateTime.fromISO(to, { zone: "utc" }).setZone(tenantTimezone).toFormat("dd/MM/yyyy HH:mm:ss")
    );
    setDraftStatus("");
    setValidationError(null);
    setSelectedBookingId(null);
    setApplied((prev) => ({
      ...prev,
      from,
      to,
      status: undefined,
      page: 1,
    }));
  }

  const selectedBookingFromList = useMemo(() => {
    if (!selectedBookingId) return null;
    return items.find((item) => item.id === selectedBookingId) ?? null;
  }, [items, selectedBookingId]);

  const bookingDetails = useMemo(() => {
    const detailed = bookingByIdQuery.data?.booking ?? null;
    const base = selectedBookingFromList;

    if (!detailed) return base;
    if (!base) return detailed;

    return {
      ...base,
      ...detailed,
      start: isValidIsoUtc(detailed.start) ? detailed.start : base.start,
      end: isValidIsoUtc(detailed.end) ? detailed.end : base.end,
      serviceName: detailed.serviceName || base.serviceName,
      professionalName: detailed.professionalName || base.professionalName,
      customerName: detailed.customerName ?? base.customerName,
      customerPhone: detailed.customerPhone ?? base.customerPhone,
      customerEmail: detailed.customerEmail ?? base.customerEmail,
      createdAt: isValidIsoUtc(detailed.createdAt) ? detailed.createdAt : base.createdAt,
      cancelledAt: detailed.cancelledAt ?? base.cancelledAt,
    };
  }, [bookingByIdQuery.data, selectedBookingFromList]);

  function renderBookingRow(item: BookingReadItem) {
    return (
      <button
        key={item.id}
        type="button"
        className="w-full rounded-3xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-white/20"
        onClick={() => setSelectedBookingId(item.id)}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-secondary">
              {formatUtcTimeRangeInTenantTimezone(item.start, item.end, tenantTimezone)}
            </p>
            <p className="mt-1 text-sm font-semibold text-white">{item.serviceName}</p>
            <p className="mt-1 text-sm text-text-soft">
              {resolveCustomerName(item.customerName)}
              {shouldDisplayValue(item.customerPhone) ? (
                <span className="text-text-soft"> • {item.customerPhone}</span>
              ) : null}
              {shouldDisplayValue(item.customerEmail) ? (
                <span className="text-text-soft"> • {item.customerEmail}</span>
              ) : null}
            </p>
            <p className="mt-1 text-xs text-text-soft">
              Profissional: <span className="font-medium text-white">{item.professionalName}</span>
            </p>
          </div>
          <Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge>
        </div>
      </button>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-white">Minha agenda</h2>
        <p className="mt-2 text-sm text-text-soft">{rangeLabel}</p>
      </div>

      <Card variant="glass" padding="lg">
        <CardTitle>Filtros</CardTitle>
        <CardDescription className="mt-2">
          Ajuste o periodo e o status para visualizar sua agenda.
        </CardDescription>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-white">De</span>
            <Input
              type="text"
              value={draftFromText}
              onChange={(event) => {
                setDraftFromText(event.target.value);
              }}
              placeholder="06/05/2026 00:00:00"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-white">Ate</span>
            <Input
              type="text"
              value={draftToText}
              onChange={(event) => {
                setDraftToText(event.target.value);
              }}
              placeholder="06/05/2026 23:59:59"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-white">Status</span>
            <Select
              value={draftStatus}
              options={statusOptions}
              onValueChange={(value) => setDraftStatus(value)}
            />
          </label>
        </div>

        {validationError ? (
          <div role="alert" className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">Filtro invalido</p>
            <p className="mt-2 text-sm text-text-soft">{validationError}</p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={applyFilters}>Aplicar filtros</Button>
          <Button variant="secondary" onClick={clearFilters}>
            Limpar
          </Button>
        </div>
      </Card>

      <Card variant="glass" padding="lg">
        <CardTitle>Agendamentos</CardTitle>
        <CardDescription className="mt-2">
          Selecione um agendamento para ver o detalhe.
        </CardDescription>

        <div className="mt-6 grid gap-3">
          {bookingsQuery.isLoading ? (
            <p className="text-sm text-text-soft">Carregando sua agenda...</p>
          ) : bookingsQuery.isError ? (
            <div role="alert" className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Nao foi possivel carregar sua agenda</p>
              <p className="mt-2 text-sm text-text-soft">
                Tente novamente. Se o problema continuar, verifique a API.
              </p>
              <div className="mt-3">
                <Button variant="secondary" size="sm" onClick={() => bookingsQuery.refetch()}>
                  Tentar novamente
                </Button>
              </div>
            </div>
          ) : isEmpty ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold text-white">Nenhum agendamento no periodo selecionado</p>
              <p className="mt-2 text-sm text-text-soft">
                Ajuste o periodo ou remova o filtro de status.
              </p>
            </div>
          ) : (
            items.map(renderBookingRow)
          )}
        </div>
      </Card>

      {isDetailsOpen && selectedBookingId && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[1200] flex items-start justify-center overflow-y-auto bg-black/80 px-4 py-4 sm:items-center sm:py-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="minha-agenda-booking-details-title"
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  setSelectedBookingId(null);
                }
              }}
            >
              <div className="relative z-[1201] w-full max-w-lg max-h-[calc(100vh-2rem)] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[28px] border border-white/30 bg-[#141416] p-4 shadow-2xl sm:p-6">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
                  <div className="min-w-0">
                    <CardTitle id="minha-agenda-booking-details-title">Detalhe do agendamento</CardTitle>
                    <CardDescription className="mt-2 break-all">ID: {selectedBookingId}</CardDescription>
                  </div>
                  <Button type="button" size="sm" variant="secondary" onClick={() => setSelectedBookingId(null)}>
                    Fechar
                  </Button>
                </div>

                {bookingByIdQuery.isLoading ? (
                  <p className="mt-6 text-sm text-text-soft">Carregando detalhe...</p>
                ) : bookingByIdQuery.isError ? (
                  <div role="alert" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white">Nao foi possivel carregar o detalhe</p>
                    <div className="mt-3">
                      <Button variant="secondary" size="sm" onClick={() => bookingByIdQuery.refetch()}>
                        Tentar novamente
                      </Button>
                    </div>
                  </div>
                ) : bookingDetails ? (
                  <div className="mt-6 grid gap-4">
                    <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-text-soft">Resumo</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <Badge variant={statusVariant(bookingDetails.status)}>
                          {statusLabel(bookingDetails.status)}
                        </Badge>
                        <span className="text-sm font-semibold text-secondary">
                          {safeFormatUtcTimeRangeInTenantTimezone(bookingDetails.start, bookingDetails.end, tenantTimezone)}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-text-soft">Atendimento</p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {bookingDetails.serviceName || "Servico nao informado"}
                      </p>
                      <p className="mt-1 text-sm text-text-soft">
                        {bookingDetails.professionalName || "Profissional nao informado"}
                      </p>
                    </div>

                    <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-text-soft">Cliente</p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {resolveCustomerName(bookingDetails.customerName)}
                      </p>
                      {shouldDisplayValue(bookingDetails.customerPhone) ? (
                        <p className="mt-1 text-sm text-text-soft">{bookingDetails.customerPhone}</p>
                      ) : null}
                      {shouldDisplayValue(bookingDetails.customerEmail) ? (
                        <p className="mt-1 text-sm text-text-soft">{bookingDetails.customerEmail}</p>
                      ) : null}
                    </div>

                    <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-text-soft">Metadados</p>
                      <p className="mt-3 text-xs text-text-soft">
                        createdAt:{" "}
                        <span className="font-medium text-white">
                          {(() => {
                            const dt = DateTime.fromISO(bookingDetails.createdAt, { zone: "utc" }).setZone(
                              tenantTimezone
                            );
                            return dt.isValid
                              ? dt.toFormat("dd/MM/yyyy HH:mm:ss")
                              : bookingDetails.createdAt;
                          })()}
                        </span>
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
