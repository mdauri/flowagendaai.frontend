import { Badge } from "@/components/flow/badge";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { formatDateTimeInTenantTimezone } from "@/lib/date-time";
import type { Professional } from "@/types/professional";

interface ProfessionalsListProps {
  professionals: Professional[];
  tenantTimezone: string;
}

export function ProfessionalsList({
  professionals,
  tenantTimezone,
}: ProfessionalsListProps) {
  return (
    <div className="grid gap-4">
      {professionals.map((professional) => (
        <Card
          key={professional.id}
          variant="surface"
          padding="md"
          className="border-white/10"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>{professional.name}</CardTitle>
              <CardDescription className="mt-2">
                Profissional operacional vinculado ao tenant autenticado.
              </CardDescription>
              <p className="mt-4 text-sm text-text-soft">
                Criado em{" "}
                {formatDateTimeInTenantTimezone(
                  professional.createdAt,
                  tenantTimezone
                )}
              </p>
            </div>

            <Badge variant="success" className="justify-center md:justify-start">
              Integrado
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}
