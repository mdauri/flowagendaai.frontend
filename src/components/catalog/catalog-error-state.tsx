import { AlertCircle } from "lucide-react";
import { Button } from "@/components/flow/button";
import { colors, typography } from "@/design-system";
import { ApiError } from "@/types/api";

interface CatalogErrorStateProps {
  error?: Error | ApiError | null;
  onRetry?: () => void;
  onBack?: () => void;
}

export function CatalogErrorState({ error, onRetry, onBack }: CatalogErrorStateProps) {
  const isNotFound = error instanceof ApiError && error.status === 404;

  const title = isNotFound
    ? "Catálogo não encontrado"
    : "Erro ao carregar catálogo";

  const description = isNotFound
    ? "Não foi possível encontrar este catálogo. Verifique o link e tente novamente."
    : "Tente recarregar a página ou voltar mais tarde.";

  return (
    <div
      className="flex min-h-[400px] flex-col items-center justify-center gap-6 px-4 py-12 text-center"
      role="alert"
      aria-label={title}
    >
      {/* Icon */}
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{
          backgroundColor: "rgba(248, 113, 113, 0.1)",
        }}
      >
        <AlertCircle
          size={40}
          style={{
            color: colors.feedback.danger.text,
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
          {title}
        </h2>
        <p
          className="max-w-xs text-sm"
          style={{
            color: colors.text.soft,
            fontFamily: typography.family.sans,
            lineHeight: typography.leading.relaxed,
          }}
        >
          {description}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onRetry && (
          <Button
            variant="primary"
            size="md"
            onClick={onRetry}
            style={{
              fontFamily: typography.family.sans,
              fontWeight: typography.weight.semibold,
            }}
          >
            Recarregar
          </Button>
        )}
        {onBack && (
          <Button
            variant="secondary"
            size="md"
            onClick={onBack}
            style={{
              fontFamily: typography.family.sans,
              fontWeight: typography.weight.semibold,
            }}
          >
            Voltar
          </Button>
        )}
      </div>
    </div>
  );
}
