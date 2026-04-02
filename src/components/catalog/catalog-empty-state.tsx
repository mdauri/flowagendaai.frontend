import { Sparkles } from "lucide-react";
import { Button } from "@/components/flow/button";
import { colors, typography } from "@/design-system";

interface CatalogEmptyStateProps {
  onBack?: () => void;
}

export function CatalogEmptyState({ onBack }: CatalogEmptyStateProps) {
  return (
    <div
      className="flex min-h-[400px] flex-col items-center justify-center gap-6 px-4 py-12 text-center"
      role="status"
      aria-label="Nenhum serviço disponível"
    >
      {/* Icon */}
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full"
        style={{
          backgroundColor: "rgba(255, 224, 163, 0.1)",
        }}
      >
        <Sparkles
          size={48}
          style={{
            color: colors.brand.tertiary,
          }}
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col items-center gap-2">
        <h2
          className="text-lg font-bold"
          style={{
            color: colors.text.primary,
            fontFamily: typography.family.sans,
            fontWeight: typography.weight.bold,
          }}
        >
          Nenhum serviço disponível
        </h2>
        <p
          className="max-w-xs text-sm"
          style={{
            color: colors.text.soft,
            fontFamily: typography.family.sans,
            lineHeight: typography.leading.relaxed,
          }}
        >
          Este profissional ainda não cadastrou serviços.
        </p>
      </div>

      {/* Action */}
      {onBack && (
        <Button
          variant="secondary"
          size="md"
          onClick={onBack}
          style={{
            minWidth: "200px",
            fontFamily: typography.family.sans,
            fontWeight: typography.weight.semibold,
          }}
        >
          Voltar
        </Button>
      )}
    </div>
  );
}
