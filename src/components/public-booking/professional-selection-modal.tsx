import { X } from "lucide-react";
import { colors, typography, shadows } from "@/design-system";
import { Button } from "@/components/flow/button";

export interface ProfessionalOption {
  id: string;
  name: string;
  slug: string;
}

interface ProfessionalSelectionModalProps {
  isOpen: boolean;
  serviceName: string;
  professionals: ProfessionalOption[];
  tenantSlug: string;
  serviceId: string;
  onSelectProfessional: (professionalSlug: string) => void;
  onClose: () => void;
}

export function ProfessionalSelectionModal({
  isOpen,
  serviceName,
  professionals,
  tenantSlug,
  serviceId,
  onSelectProfessional,
  onClose,
}: ProfessionalSelectionModalProps) {
  if (!isOpen) {
    return null;
  }

  const handleSelect = (professionalSlug: string) => {
    onSelectProfessional(professionalSlug);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="relative mx-auto my-4 w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl"
        style={{
          boxShadow: shadows.depth,
        }}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2
              id="modal-title"
              className="text-xl font-black"
              style={{
                color: colors.text.primary,
                fontFamily: typography.family.sans,
                fontWeight: typography.weight.black,
              }}
            >
              Escolha o profissional
            </h2>
            <p
              className="mt-1 text-sm"
              style={{
                color: colors.text.muted,
                fontFamily: typography.family.sans,
              }}
            >
              {serviceName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Professional List */}
        <div className="space-y-3">
          {professionals.map((professional) => (
            <button
              key={professional.id}
              type="button"
              onClick={() => handleSelect(professional.slug)}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <div className="flex items-center gap-3">
                {/* Avatar Placeholder */}
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                  style={{
                    backgroundColor: colors.brand.primary,
                  }}
                  aria-hidden="true"
                >
                  {professional.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p
                    className="font-semibold"
                    style={{
                      color: colors.text.primary,
                      fontFamily: typography.family.sans,
                      fontWeight: typography.weight.semibold,
                    }}
                  >
                    {professional.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      color: colors.text.muted,
                      fontFamily: typography.family.sans,
                    }}
                  >
                    Clique para agendar
                  </p>
                </div>
              </div>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/20"
                aria-hidden="true"
              >
                <div className="h-3 w-3 rounded-full bg-white/20" />
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
