import { createPortal } from "react-dom";
import { useEffect, useId, useMemo, useState } from "react";
import { Button } from "@/components/flow/button";
import { CardDescription, CardTitle } from "@/components/flow/card";
import { Textarea } from "@/components/flow/textarea";
import { FeedbackBanner } from "@/components/shared/feedback-banner";

export interface MarkDepositPaidDialogProps {
  isOpen: boolean;
  bookingSummary: {
    customerName?: string | null;
    customerPhone?: string | null;
    customerEmail?: string | null;
    professionalName?: string | null;
    serviceName?: string | null;
  };
  isSubmitting: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: (input: { notes?: string }) => void;
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

export function MarkDepositPaidDialog({
  isOpen,
  bookingSummary,
  isSubmitting,
  errorMessage,
  onClose,
  onConfirm,
}: MarkDepositPaidDialogProps) {
  const dialogTitleId = useId();
  const notesFieldId = useId();
  const [notes, setNotes] = useState("");

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
      setNotes("");
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
      <div className="w-full max-w-lg max-h-[calc(100vh-3rem)] overflow-y-auto rounded-[28px] border border-white/10 bg-[#141416] p-6">
        <CardTitle id={dialogTitleId}>Marcar sinal como pago</CardTitle>
        <CardDescription className="mt-3">
          Confirme que o sinal foi recebido manualmente. O agendamento sera promovido para confirmado.
        </CardDescription>

        <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-text-soft">
          <p>
            Cliente:{" "}
            <span className="font-semibold text-white">{resolvedSummary.customerName}</span>
          </p>
          {resolveOptionalLine("Servico", resolvedSummary.serviceName)}
          {resolveOptionalLine("Profissional", resolvedSummary.professionalName)}
          {resolveOptionalLine("WhatsApp", resolvedSummary.customerPhone)}
          {resolveOptionalLine("Email", resolvedSummary.customerEmail)}
        </div>

        <div className="mt-5">
          <label className="text-sm font-semibold text-white" htmlFor={notesFieldId}>
            Observacao (opcional)
          </label>
          <Textarea
            id={notesFieldId}
            className="mt-2"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            disabled={isSubmitting}
            maxLength={300}
            placeholder="Ex.: pagamento recebido via Pix/manual"
          />
        </div>

        {errorMessage ? (
          <FeedbackBanner
            className="mt-4"
            title="Nao foi possivel marcar o sinal"
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
            variant="primary"
            size="md"
            onClick={() => onConfirm({ notes: notes.trim() || undefined })}
            disabled={isSubmitting}
            autoFocus
          >
            {isSubmitting ? "Confirmando..." : "Confirmar"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
