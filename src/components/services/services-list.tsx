import { Badge } from "@/components/flow/badge";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { formatDateTimeInTenantTimezone } from "@/lib/date-time";
import type { Service } from "@/types/service";

interface ServicesListProps {
  services: Service[];
  tenantTimezone: string;
}

export function ServicesList({
  services,
  tenantTimezone,
}: ServicesListProps) {
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
                  tenantTimezone
                )}
              </p>
            </div>

            <Badge variant="info" className="justify-center md:justify-start">
              {service.durationInMinutes} min
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}
