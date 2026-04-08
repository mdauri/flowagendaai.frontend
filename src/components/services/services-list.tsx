import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/flow/badge";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { ServiceImageFallback } from "@/components/catalog/service-image-fallback";
import { formatDateTimeInTenantTimezone } from "@/lib/date-time";
import type { Service } from "@/types/service";

interface ServicesListProps {
  services: Service[];
  tenantTimezone: string;
  canManageServices?: boolean;
  onEditService?: (service: Service) => void;
  onDeleteService?: (service: Service) => void;
}

export function ServicesList({
  services,
  tenantTimezone,
  canManageServices = true,
  onEditService,
  onDeleteService,
}: ServicesListProps) {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4">
      {services.map((service) => (
        <Card
          key={service.id}
          variant="surface"
          padding="md"
          className="border-white/10"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                {service.thumbnailUrl || service.imageUrl ? (
                  <img
                    src={service.thumbnailUrl ?? service.imageUrl ?? undefined}
                    alt={service.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <ServiceImageFallback
                    serviceId={service.id}
                    serviceName={service.name}
                    className="h-full w-full"
                  />
                )}
              </div>

              <div className="flex-1">
                <CardTitle>{service.name}</CardTitle>

                {service.description && (
                  <p
                    className="mt-2 text-sm text-text-soft"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {service.description}
                  </p>
                )}

                <CardDescription className="mt-2">
                  Servico operacional vinculado ao tenant autenticado.
                </CardDescription>
                <p className="mt-4 text-sm font-semibold text-white">
                  Duracao: {service.durationInMinutes} min
                </p>
                <p className="mt-4 text-sm text-text-soft">
                  Criado em{" "}
                  {formatDateTimeInTenantTimezone(
                    service.createdAt,
                    tenantTimezone,
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Badge
                  variant={service.isActive ? "success" : "warning"}
                  className="justify-center md:justify-start"
                >
                  {service.isActive ? "Ativo" : "Inativo"}
                </Badge>
                <Badge variant="info" className="justify-center md:justify-start">
                  {service.durationInMinutes} min
                </Badge>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
                {canManageServices ? (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEditService?.(service)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onDeleteService?.(service)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remover
                    </Button>
                  </>
                ) : null}

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    navigate(`/app/services/${service.id}/professionals`)
                  }
                >
                  <Users className="mr-2 h-4 w-4" />
                  Profissionais
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
