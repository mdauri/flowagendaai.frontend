import { Badge } from "@/components/flow/badge";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";

interface TenantTimezoneInfoProps {
  timezone: string;
}

export function TenantTimezoneInfo({ timezone }: TenantTimezoneInfoProps) {
  return (
    <Card variant="glass" padding="lg">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle>Timezone do tenant</CardTitle>
          <CardDescription className="mt-3">
            Os horarios desta consulta sempre seguem o timezone operacional do tenant autenticado.
          </CardDescription>
        </div>

        <Badge variant="info" className="justify-center md:justify-start">
          {timezone}
        </Badge>
      </div>
    </Card>
  );
}
