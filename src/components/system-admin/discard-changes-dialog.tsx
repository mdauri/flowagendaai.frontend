import { createPortal } from "react-dom";
import { Button } from "@/components/flow/button";
import { CardDescription, CardTitle } from "@/components/flow/card";

interface DiscardChangesDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DiscardChangesDialog({
  isOpen,
  title,
  description,
  onClose,
  onConfirm,
}: DiscardChangesDialogProps) {
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
      aria-labelledby="discard-changes-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg rounded-[28px] border border-amber-400/30 bg-[#170f0f] p-6">
        <CardTitle id="discard-changes-title">{title}</CardTitle>
        <CardDescription className="mt-3">{description}</CardDescription>

        <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-text-soft">
          As alteracoes deste modulo serao descartadas se voce continuar.
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" size="md" onClick={onClose}>
            Continuar editando
          </Button>
          <Button type="button" size="md" onClick={onConfirm} autoFocus>
            Descartar alteracoes
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
