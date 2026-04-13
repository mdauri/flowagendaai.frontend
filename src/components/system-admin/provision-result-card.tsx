import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Button } from "@/components/flow/button";

interface ProvisionResultCardProps {
  tenantId: string;
  tenantName: string;
  adminUserId: string;
  adminEmail: string;
  createdAtUtc: string;
  onCreateAnother?: () => void;
}

export function ProvisionResultCard({
  tenantId,
  tenantName,
  adminUserId,
  adminEmail,
  createdAtUtc,
  onCreateAnother,
}: ProvisionResultCardProps) {
  return (
    <Card variant="glass" padding="lg" className="border border-emerald-500/30 bg-emerald-500/10">
      <CardTitle>Provisionamento concluido</CardTitle>
      <CardDescription className="mt-3">Tenant e usuario administrativo inicial foram criados com sucesso.</CardDescription>

      <dl className="mt-5 grid gap-3 text-sm text-text-soft md:grid-cols-2">
        <div>
          <dt className="font-semibold text-white">Tenant ID</dt>
          <dd className="break-all">{tenantId}</dd>
        </div>
        <div>
          <dt className="font-semibold text-white">Tenant</dt>
          <dd>{tenantName}</dd>
        </div>
        <div>
          <dt className="font-semibold text-white">Admin User ID</dt>
          <dd className="break-all">{adminUserId}</dd>
        </div>
        <div>
          <dt className="font-semibold text-white">Admin Email</dt>
          <dd>{adminEmail}</dd>
        </div>
        <div className="md:col-span-2">
          <dt className="font-semibold text-white">Criado em (UTC)</dt>
          <dd>{createdAtUtc}</dd>
        </div>
      </dl>

      {onCreateAnother ? (
        <div className="mt-6">
          <Button variant="secondary" size="md" onClick={onCreateAnother}>
            Criar outro mandante
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
