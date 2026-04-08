import { Button } from "@/components/flow/button";
import { Badge } from "@/components/flow/badge";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Pencil, Trash2 } from "lucide-react";
import { formatDateTimeInTenantTimezone } from "@/lib/date-time";
import type { Professional } from "@/types/professional";

interface ProfessionalsListProps {
  professionals: Professional[];
  tenantTimezone: string;
  canManageProfessionals?: boolean;
  pendingImageUploads?: Record<string, { file: File; message: string }>;
  onRetryImageUpload?: (professional: Professional) => void;
  onEditProfessional?: (professional: Professional) => void;
  onDeleteProfessional?: (professional: Professional) => void;
}

export function ProfessionalsList({
  professionals,
  tenantTimezone,
  canManageProfessionals = false,
  pendingImageUploads,
  onRetryImageUpload,
  onEditProfessional,
  onDeleteProfessional,
}: ProfessionalsListProps) {
  return (
    <div className="grid gap-4">
      {professionals.map((professional) => {
        const imageSrc = professional.thumbnailUrl ?? professional.imageUrl ?? null;
        const pendingUpload = pendingImageUploads?.[professional.id] ?? null;

        return (
        <Card
          key={professional.id}
          variant="surface"
          padding="md"
          className="border-white/10"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-4">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={`Foto de ${professional.name}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : null}
                {!imageSrc ? (
                  <div className="flex h-full w-full items-center justify-center text-lg font-black text-white/80">
                    {professional.name.charAt(0).toUpperCase()}
                  </div>
                ) : null}
              </div>

              <div className="min-w-0">
                <CardTitle className="truncate">{professional.name}</CardTitle>
                <CardDescription className="mt-2">
                  Profissional operacional vinculado ao tenant autenticado.
                </CardDescription>

                {professional.description ? (
                  <p
                    className="mt-3 text-sm leading-relaxed text-text-soft"
                    style={{
                      whiteSpace: "pre-wrap",
                      display: "-webkit-box",
                      WebkitLineClamp: "5",
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {professional.description}
                  </p>
                ) : null}

                {pendingUpload ? (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white">
                      Foto pendente
                    </p>
                    <p className="mt-1 text-sm text-text-soft">
                      {pendingUpload.message}
                    </p>
                    <div className="mt-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onRetryImageUpload?.(professional)}
                      >
                        Tentar novamente
                      </Button>
                    </div>
                  </div>
                ) : null}

                <p className="mt-4 text-sm text-text-soft">
                  Criado em{" "}
                  {formatDateTimeInTenantTimezone(
                    professional.createdAt,
                    tenantTimezone
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-3 md:items-end">
              <Badge variant="success" className="justify-center md:justify-start">
                Integrado
              </Badge>

              {canManageProfessionals ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onEditProfessional?.(professional)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onDeleteProfessional?.(professional)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </Card>
        );
      })}
    </div>
  );
}
