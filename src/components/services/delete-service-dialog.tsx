import { createPortal } from "react-dom";
import { Button } from "@/components/flow/button";
import { CardDescription, CardTitle } from "@/components/flow/card";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import type { Service } from "@/types/service";

interface DeleteServiceDialogProps {
  service: Service | null;
  isOpen: boolean;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteServiceDialog({
  service,
  isOpen,
  isSubmitting,
  errorMessage,
  onClose,
  onConfirm,
}: DeleteServiceDialogProps) {
  if (!isOpen || !service) {
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
      aria-labelledby="service-delete-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg max-h-[calc(100vh-3rem)] overflow-y-auto rounded-[28px] border border-amber-400/30 bg-[#170f0f] p-6">
        <CardTitle id="service-delete-title">Desativar servico</CardTitle>
        <CardDescription className="mt-3">
          Esta remocao e logica. O servico deixa de aparecer nos fluxos ativos do tenant.
        </CardDescription>

        <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-text-soft">
          <p>
            Servico: <span className="font-semibold text-white">{service.name}</span>
          </p>
          <p className="mt-2">
            Isso nao remove o servico do banco. Voce pode reativar editando o status depois.
          </p>
        </div>

        {errorMessage ? (
          <FeedbackBanner
            className="mt-4"
            title="Nao foi possivel desativar"
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
            size="md"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Desativando..." : "Confirmar desativacao"}
          </Button>
        </div>
      </div>
    </div>
    ,
    document.body
  );
}
