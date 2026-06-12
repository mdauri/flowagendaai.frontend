import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/flow/badge";
import { Button } from "@/components/flow/button";
import { Card, CardTitle } from "@/components/flow/card";
import { ServiceImageFallback } from "@/components/catalog/service-image-fallback";
import type { Service } from "@/types/service";

interface ServicesListProps {
  services: Service[];
  tenantTimezone?: string;
  canManageServices?: boolean;
  onEditService?: (service: Service) => void;
  onDeleteService?: (service: Service) => void;
}

export function ServicesList({
  services,
  tenantTimezone: _tenantTimezone,
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
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-3">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
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
                <p className="mt-2 text-sm font-semibold text-white">
                  R$ {service.price.toFixed(2).replace(".", ",")}
                </p>

                {service.description && (
                  <p
                    className="mt-2 text-sm text-text-soft"
                    style={{
                      whiteSpace: "pre-wrap",
                      display: "-webkit-box",
                      WebkitLineClamp: "3",
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {service.description}
                  </p>
                )}
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
                {service.requiresDeposit ? (
                  <Badge variant="warning" className="justify-center md:justify-start">
                    Exige sinal
                  </Badge>
                ) : (
                  <Badge variant="neutral" className="justify-center md:justify-start">
                    Sem sinal
                  </Badge>
                )}
                <Badge variant="info" className="justify-center text-xs md:justify-start">
                  {service.durationInMinutes} min
                </Badge>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
                {canManageServices ? (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={() => onEditService?.(service)}
                    >
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={() => onDeleteService?.(service)}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Remover
                    </Button>
                  </>
                ) : null}

                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() =>
                    navigate(`/app/services/${service.id}/professionals`)
                  }
                >
                  <Users className="mr-1 h-3.5 w-3.5" />
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
