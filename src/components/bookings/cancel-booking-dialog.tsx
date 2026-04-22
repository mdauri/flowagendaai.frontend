import { createPortal } from "react-dom";
import { useEffect, useId, useMemo, useState } from "react";
import { Button } from "@/components/flow/button";
import { CardDescription, CardTitle } from "@/components/flow/card";
import { Textarea } from "@/components/flow/textarea";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import type { BookingStatus } from "@/types/booking";

export type CancelBookingContext = "dashboard" | "public" | "professional-removal";

export interface CancelBookingSummary {
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  professionalName?: string | null;
  serviceName?: string | null;
  start?: string | null;
  end?: string | null;
  status?: BookingStatus | string | null;
}

export interface CancelBookingDialogProps {
  isOpen: boolean;
  context: CancelBookingContext;
  bookingSummary: CancelBookingSummary;
  isSubmitting: boolean;
  errorMessage?: string | null;
  supportReason?: boolean;
  onClose: () => void;
  onConfirm: (input: { reason?: string }) => void;
}

function resolveCustomerName(customerName: string | null | undefined) {
  return customerName ?? "Cliente nao informado";
}

function resolveOptionalLine(label: string, value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return (
    <p className="mt-1 text-sm text-text-soft">
      {label}: <span className="font-semibold text-white">{value}</span>
    </p>
  );
}

export function CancelBookingDialog({
  isOpen,
  context,
  bookingSummary,
  isSubmitting,
  errorMessage,
  supportReason = true,
  onClose,
  onConfirm,
}: CancelBookingDialogProps) {
  const dialogTitleId = useId();
  const reasonFieldId = useId();
  const [reason, setReason] = useState("");

  const shouldBlockClose = isSubmitting;

  const resolvedSummary = useMemo(() => {
    return {
      customerName: resolveCustomerName(bookingSummary.customerName),
      serviceName: bookingSummary.serviceName ?? null,
      professionalName: bookingSummary.professionalName ?? null,
      customerPhone: bookingSummary.customerPhone ?? null,
      customerEmail: bookingSummary.customerEmail ?? null,
    };
  }, [bookingSummary]);

  useEffect(() => {
    if (!isOpen) {
      setReason("");
    }
  }, [isOpen]);

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
      <div className="w-full max-w-lg max-h-[calc(100vh-3rem)] overflow-y-auto rounded-[28px] border border-red-500/30 bg-[#170f0f] p-6">
        <CardTitle id={dialogTitleId}>Cancelar agendamento</CardTitle>
        <CardDescription className="mt-3">
          Esta acao e definitiva. O agendamento ficara como CANCELLED.
        </CardDescription>

        <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-text-soft">
          <p>
            Cliente:{" "}
            <span className="font-semibold text-white">{resolvedSummary.customerName}</span>
          </p>
          {resolveOptionalLine("Servico", resolvedSummary.serviceName)}
          {resolveOptionalLine("Profissional", resolvedSummary.professionalName)}
          {context !== "dashboard" ? null : (
            <>
              {resolveOptionalLine("WhatsApp", resolvedSummary.customerPhone)}
              {resolveOptionalLine("Email", resolvedSummary.customerEmail)}
            </>
          )}
        </div>

        {supportReason ? (
          <div className="mt-5">
            <label className="text-sm font-semibold text-white" htmlFor={reasonFieldId}>
              Motivo (opcional)
            </label>
            <Textarea
              id={reasonFieldId}
              className="mt-2"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={isSubmitting}
              maxLength={300}
              placeholder="Ex.: cliente solicitou cancelamento"
            />
          </div>
        ) : null}

        {errorMessage ? (
          <FeedbackBanner
            className="mt-4"
            title="Nao foi possivel cancelar"
            description={errorMessage}
          />
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
            variant="danger"
            size="md"
            onClick={() => onConfirm({ reason: reason.trim() || undefined })}
            disabled={isSubmitting}
            autoFocus
          >
            {isSubmitting ? "Cancelando..." : "Confirmar cancelamento"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
