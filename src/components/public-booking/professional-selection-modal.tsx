import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { colors, typography, shadows, semanticTokens } from "@/design-system";
import { Button } from "@/components/flow/button";

export interface ProfessionalOption {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
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

interface ProfessionalAvatarProps {
  professional: ProfessionalOption;
}

function ProfessionalAvatar({ professional }: ProfessionalAvatarProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const preferredImageSrc = useMemo(
    () => professional.thumbnailUrl ?? professional.imageUrl ?? null,
    [professional.thumbnailUrl, professional.imageUrl]
  );
  const hue = useMemo(() => {
    return Array.from(professional.name).reduce((hash, char) => {
      return (hash * 33 + char.charCodeAt(0)) % 360;
    }, 29);
  }, [professional.name]);

  if (preferredImageSrc && !hasImageError) {
    return (
      <img
        src={preferredImageSrc}
        alt={`Foto de ${professional.name}`}
        className="h-full w-full object-cover"
        onError={() => setHasImageError(true)}
      />
    );
  }

  return (
    <div
      className="flex h-full w-full items-center justify-center text-lg font-bold text-white"
      style={{
        backgroundColor: `hsl(${hue} 62% 42%)`,
      }}
      aria-hidden="true"
    >
      {professional.name.charAt(0).toUpperCase()}
    </div>
  );
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
  const [selectedProfessionalSlug, setSelectedProfessionalSlug] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleSelect = (professionalSlug: string) => {
    setSelectedProfessionalSlug(professionalSlug);
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
        className="relative mx-auto my-4 w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{
          backgroundColor: "var(--theme-modal-surface, var(--theme-surface))",
          borderColor: semanticTokens.border.subtle,
          color: colors.text.primary,
          backdropFilter: `blur(${semanticTokens.blur.panel})`,
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
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-glass-subtle hover:text-text-primary"
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
              aria-pressed={selectedProfessionalSlug === professional.slug}
              className="group flex w-full items-center justify-between rounded-xl border bg-surface-glass-subtle p-4 transition-all hover:-translate-y-0.5 hover:bg-surface-glass hover:shadow-card focus:outline-none focus-visible:[box-shadow:var(--theme-focus-ring)]"
              style={{
                borderColor:
                  selectedProfessionalSlug === professional.slug
                    ? colors.brand.primary
                    : semanticTokens.border.subtle,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
                  <ProfessionalAvatar professional={professional} />
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
                className="flex h-8 w-8 items-center justify-center rounded-full border transition-all"
                style={{
                  backgroundColor:
                    selectedProfessionalSlug === professional.slug
                      ? colors.brand.primary
                      : "transparent",
                  borderColor: colors.brand.primary,
                  borderWidth: "1.5px",
                }}
                aria-hidden="true"
              >
                {selectedProfessionalSlug === professional.slug ? (
                  <Check className="h-4 w-4 text-[var(--theme-text-on-primary)]" strokeWidth={3} />
                ) : null}
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
