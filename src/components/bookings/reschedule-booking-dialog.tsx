import { createPortal } from "react-dom";
import { useEffect, useId, useMemo, useState } from "react";
import { DateTime } from "luxon";
import { Button } from "@/components/flow/button";
import { CardDescription, CardTitle } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import { Textarea } from "@/components/flow/textarea";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { formatUtcTimeRangeInTenantTimezone } from "@/lib/date-time";

export interface RescheduleBookingDialogProps {
  isOpen: boolean;
  bookingSummary: {
    bookingId: string;
    customerName?: string | null;
    professionalName?: string | null;
    serviceName?: string | null;
    start?: string | null;
    end?: string | null;
    tenantTimezone: string;
  };
  isSubmitting: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: (input: { start: string; reason?: string }) => void;
}

function resolveCustomerName(customerName: string | null | undefined) {
  return customerName ?? "Cliente nao informado";
}

function toDateTimeLocalValue(value: string | null | undefined, timezone: string): string {
  if (!value) {
    return "";
  }

  const dt = DateTime.fromISO(value, { zone: "utc" }).setZone(timezone);
  return dt.isValid ? dt.toFormat("yyyy-MM-dd'T'HH:mm") : "";
}

function convertTenantLocalDateTimeToUtcIso(value: string, timezone: string): string | null {
  if (!value) {
    return null;
  }

  const dt = DateTime.fromISO(value, { zone: timezone });
  if (!dt.isValid) {
    return null;
  }

  const isoUtc = dt.toUTC().toISO({ suppressMilliseconds: false });
  return typeof isoUtc === "string" ? isoUtc : null;
}

export function RescheduleBookingDialog({
  isOpen,
  bookingSummary,
  isSubmitting,
  errorMessage,
  onClose,
  onConfirm,
}: RescheduleBookingDialogProps) {
  const dialogTitleId = useId();
  const startFieldId = useId();
  const reasonFieldId = useId();
  const [startLocal, setStartLocal] = useState("");
  const [reason, setReason] = useState("");
  const [localValidationError, setLocalValidationError] = useState<string | null>(null);

  const shouldBlockClose = isSubmitting;

  const resolvedSummary = useMemo(() => {
    return {
      customerName: resolveCustomerName(bookingSummary.customerName),
      serviceName: bookingSummary.serviceName ?? null,
      professionalName: bookingSummary.professionalName ?? null,
      timeRange: bookingSummary.start && bookingSummary.end
        ? formatUtcTimeRangeInTenantTimezone(
            bookingSummary.start,
            bookingSummary.end,
            bookingSummary.tenantTimezone
          )
        : null,
    };
  }, [bookingSummary.customerName, bookingSummary.end, bookingSummary.serviceName, bookingSummary.start, bookingSummary.professionalName, bookingSummary.tenantTimezone]);

  useEffect(() => {
    if (!isOpen) {
      setStartLocal("");
      setReason("");
      setLocalValidationError(null);
      return;
    }

    setStartLocal(toDateTimeLocalValue(bookingSummary.start ?? null, bookingSummary.tenantTimezone));
    setReason("");
    setLocalValidationError(null);
  }, [bookingSummary.start, bookingSummary.tenantTimezone, isOpen]);

  if (!isOpen) {
    return null;
  }

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={dialogTitleId}
      aria-busy={isSubmitting}
      onClick={(event) => {
        if (shouldBlockClose) {
          return;
        }

        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape") {
          return;
        }

        if (shouldBlockClose) {
          event.preventDefault();
          return;
        }

        onClose();
      }}
    >
      <div className="w-full max-w-lg max-h-[calc(100vh-3rem)] overflow-y-auto rounded-[28px] border border-white/10 bg-[#141416] p-6">
        <CardTitle id={dialogTitleId}>Reagendar agendamento</CardTitle>
        <CardDescription className="mt-3">
          O novo horario sera confirmado apenas apos a resposta do sistema.
        </CardDescription>

        <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-text-soft">
          <p>
            Cliente:{" "}
            <span className="font-semibold text-white">{resolvedSummary.customerName}</span>
          </p>
          {resolvedSummary.serviceName ? (
            <p className="mt-1 text-sm text-text-soft">
              Servico: <span className="font-semibold text-white">{resolvedSummary.serviceName}</span>
            </p>
          ) : null}
          {resolvedSummary.professionalName ? (
            <p className="mt-1 text-sm text-text-soft">
              Profissional:{" "}
              <span className="font-semibold text-white">{resolvedSummary.professionalName}</span>
            </p>
          ) : null}
          {resolvedSummary.timeRange ? (
            <p className="mt-1 text-sm text-text-soft">
              Horario atual:{" "}
              <span className="font-semibold text-white">{resolvedSummary.timeRange}</span>
            </p>
          ) : null}
          <p className="mt-1 text-sm text-text-soft">
            Horario em: <span className="font-semibold text-white">{bookingSummary.tenantTimezone}</span>
          </p>
        </div>

        <div className="mt-5 grid gap-5">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-white" htmlFor={startFieldId}>
              Novo horario
            </label>
            <Input
              id={startFieldId}
              type="datetime-local"
              value={startLocal}
              onChange={(event) => {
                setStartLocal(event.target.value);
                setLocalValidationError(null);
              }}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-white" htmlFor={reasonFieldId}>
              Motivo (opcional)
            </label>
            <Textarea
              id={reasonFieldId}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={isSubmitting}
              maxLength={300}
              placeholder="Ex.: cliente solicitou reagendamento"
            />
          </div>
        </div>

        {localValidationError ? (
          <div className="mt-4" role="alert">
            <FeedbackBanner
              title="Informe um horario valido"
              description={localValidationError}
            />
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-4" role="alert">
            <FeedbackBanner
              title="Nao foi possivel reagendar"
              description={errorMessage}
            />
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Voltar
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => {
              const utcStart = convertTenantLocalDateTimeToUtcIso(
                startLocal,
                bookingSummary.tenantTimezone
              );

              if (!utcStart) {
                setLocalValidationError(
                  "Selecione um horario valido para continuar."
                );
                return;
              }

              onConfirm({
                start: utcStart,
                reason: reason.trim() || undefined,
              });
            }}
            disabled={isSubmitting || startLocal.trim().length === 0}
            autoFocus
          >
            {isSubmitting ? "Reagendando..." : "Confirmar reagendamento"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

