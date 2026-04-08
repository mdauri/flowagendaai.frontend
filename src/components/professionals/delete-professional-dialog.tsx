import { Button } from "@/components/flow/button";
import { CardDescription, CardTitle } from "@/components/flow/card";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import type { Professional } from "@/types/professional";

interface DeleteProfessionalDialogProps {
  professional: Professional | null;
  isOpen: boolean;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteProfessionalDialog({
  professional,
  isOpen,
  isSubmitting,
  errorMessage,
  onClose,
  onConfirm,
}: DeleteProfessionalDialogProps) {
  if (!isOpen || !professional) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="professional-delete-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg rounded-[28px] border border-amber-400/30 bg-[#170f0f] p-6">
        <CardTitle id="professional-delete-title">Remover profissional</CardTitle>
        <CardDescription className="mt-3">
          Esta remocao e logica. O profissional deixa de aparecer nos fluxos ativos do tenant.
        </CardDescription>

        <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-text-soft">
          <p>
            Profissional: <span className="font-semibold text-white">{professional.name}</span>
          </p>
          <p className="mt-2">
            Se houver agendamentos impactados, voce sera levado para a tela de resolucao antes da
            finalizacao.
          </p>
        </div>

        {errorMessage ? (
          <FeedbackBanner
            className="mt-4"
            title="Nao foi possivel remover"
            description={errorMessage}
          />
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={isSubmitting}>
            Voltar
          </Button>
          <Button type="button" size="md" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Removendo..." : "Confirmar remocao"}
          </Button>
        </div>
      </div>
    </div>
  );
}
