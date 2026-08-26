import { useMemo, useState } from "react";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { SectionHeading } from "@/components/flow/section-heading";
import { PageState } from "@/components/shared/page-state";
import { SystemAdminGate } from "@/components/system-admin/system-admin-gate";
import { useAuth } from "@/hooks/use-auth";
import { useCommercialFunnelQuery } from "@/hooks/use-commercial-funnel-query";

function isoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function presetPeriod(days: number) {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - (days - 1));
  return { from: isoDate(from), to: isoDate(to) };
}

function percentage(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function duration(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "—";
  const hours = value / 3_600_000;
  if (hours < 24) return `${hours.toFixed(1)} h`;
  return `${(hours / 24).toFixed(1)} dias`;
}

function dateTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function SystemAdminCommercialFunnelPage() {
  const auth = useAuth();
  const [period, setPeriod] = useState(() => presetPeriod(30));
  const query = useCommercialFunnelQuery(period);
  const isAllowed = auth.user?.role === "system-admin";

  const cards = useMemo(() => {
    const data = query.data;
    if (!data) return [];
    return [
      { label: "Trials criados", value: data.summary.signups.toString(), detail: "coorte do periodo" },
      { label: "Publicaram", value: data.summary.published.toString(), detail: percentage(data.rates.signupToPublish) },
      { label: "1º booking real", value: data.summary.firstRealBooking.toString(), detail: percentage(data.rates.signupToFirstRealBooking) },
      { label: "Pagaram", value: data.summary.paid.toString(), detail: percentage(data.rates.signupToPaid) },
      { label: "Trial ativos", value: data.summary.trialing.toString(), detail: "agora" },
      { label: "Expirados/cancelados", value: data.summary.expiredOrCanceled.toString(), detail: "agora" },
    ];
  }, [query.data]);

  if (!isAllowed) {
    return (
      <PageState
        title="Acesso restrito"
        description="Apenas system-admin pode acessar o funil comercial."
      />
    );
  }

  return (
    <SystemAdminGate
      isAllowed={isAllowed}
      fallbackDescription="Apenas system-admin pode acessar o funil comercial."
    >
      <SectionHeading
        eyebrow="System Admin"
        title="Funil comercial"
        description="Acompanhe trial, ativacao, primeiro valor e conversao em pagamento por origem."
      />

      <Card variant="glass" padding="lg" className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <CardTitle>Periodo da coorte</CardTitle>
            <CardDescription className="mt-2">
              O periodo seleciona tenants pela data de criacao do trial.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {[7, 30, 90].map((days) => (
              <Button
                key={days}
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setPeriod(presetPeriod(days))}
              >
                {days} dias
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-[var(--theme-text-primary)]">
            De
            <input
              type="date"
              value={period.from}
              onChange={(event) => setPeriod((current) => ({ ...current, from: event.target.value }))}
              className="rounded-xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] px-3 py-2 text-[var(--theme-text-primary)]"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-[var(--theme-text-primary)]">
            Ate
            <input
              type="date"
              value={period.to}
              onChange={(event) => setPeriod((current) => ({ ...current, to: event.target.value }))}
              className="rounded-xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] px-3 py-2 text-[var(--theme-text-primary)]"
            />
          </label>
        </div>
      </Card>

      {query.isLoading ? (
        <PageState title="Carregando funil" description="Consolidando dados comerciais..." />
      ) : query.isError || !query.data ? (
        <PageState
          title="Falha ao carregar funil"
          description="Nao foi possivel consolidar os dados comerciais."
          actionLabel="Tentar novamente"
          onAction={() => void query.refetch()}
        />
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <Card key={card.label} variant="premium" padding="lg">
                <p className="text-sm text-text-soft">{card.label}</p>
                <p className="mt-2 text-3xl font-bold text-[var(--theme-text-primary)]">{card.value}</p>
                <p className="mt-1 text-xs text-text-soft">{card.detail}</p>
              </Card>
            ))}
          </div>

          <Card variant="glass" padding="lg" className="mt-6">
            <CardTitle>Velocidade de ativacao</CardTitle>
            <CardDescription className="mt-2">
              Quanto tempo os novos tenants levam para chegar ao primeiro valor.
            </CardDescription>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-text-soft">Trial → publicar</p>
                <p className="mt-2 text-xl font-bold text-[var(--theme-text-primary)]">{duration(query.data.timingsMs.averageTimeToPublish)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-text-soft">Trial → 1º booking</p>
                <p className="mt-2 text-xl font-bold text-[var(--theme-text-primary)]">{duration(query.data.timingsMs.averageTimeToFirstRealBooking)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-text-soft">Publicar → 1º booking</p>
                <p className="mt-2 text-xl font-bold text-[var(--theme-text-primary)]">{duration(query.data.timingsMs.averagePublishToFirstRealBooking)}</p>
              </div>
            </div>
          </Card>

          <Card variant="glass" padding="lg" className="mt-6 overflow-hidden">
            <CardTitle>Aquisicao por origem</CardTitle>
            <CardDescription className="mt-2">
              Compare quais campanhas trazem trials que realmente ativam e pagam.
            </CardDescription>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-text-soft">
                  <tr>
                    <th className="px-3 py-2">Origem</th>
                    <th className="px-3 py-2">Campanha</th>
                    <th className="px-3 py-2 text-right">Trials</th>
                    <th className="px-3 py-2 text-right">Publicaram</th>
                    <th className="px-3 py-2 text-right">1º booking</th>
                    <th className="px-3 py-2 text-right">Pagaram</th>
                    <th className="px-3 py-2 text-right">Conv.</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.attribution.map((row) => (
                    <tr key={`${row.source}:${row.medium ?? ""}:${row.campaign ?? ""}`} className="border-t border-[var(--theme-border-subtle)]">
                      <td className="px-3 py-3 text-[var(--theme-text-primary)]">{row.source}{row.medium ? ` / ${row.medium}` : ""}</td>
                      <td className="px-3 py-3 text-text-soft">{row.campaign ?? "—"}</td>
                      <td className="px-3 py-3 text-right">{row.signups}</td>
                      <td className="px-3 py-3 text-right">{row.published}</td>
                      <td className="px-3 py-3 text-right">{row.firstRealBooking}</td>
                      <td className="px-3 py-3 text-right">{row.paid}</td>
                      <td className="px-3 py-3 text-right font-semibold">{percentage(row.signupToPaidRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card variant="glass" padding="lg" className="mt-6 overflow-hidden">
            <CardTitle>Trials da coorte</CardTitle>
            <CardDescription className="mt-2">
              Lista operacional para identificar quem precisa de ajuda para publicar, receber o primeiro booking ou converter.
            </CardDescription>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-text-soft">
                  <tr>
                    <th className="px-3 py-2">Tenant</th>
                    <th className="px-3 py-2">Criado</th>
                    <th className="px-3 py-2">Origem</th>
                    <th className="px-3 py-2">Publicou</th>
                    <th className="px-3 py-2">1º booking</th>
                    <th className="px-3 py-2">Billing</th>
                    <th className="px-3 py-2">Fim trial</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.tenants.map((tenant) => (
                    <tr key={tenant.tenantId} className="border-t border-[var(--theme-border-subtle)]">
                      <td className="px-3 py-3">
                        <p className="font-semibold text-[var(--theme-text-primary)]">{tenant.tenantName}</p>
                        <p className="text-xs text-text-soft">{tenant.tenantSlug ?? tenant.tenantId}</p>
                      </td>
                      <td className="px-3 py-3 text-text-soft">{dateTime(tenant.createdAt)}</td>
                      <td className="px-3 py-3 text-text-soft">{tenant.acquisition.source}{tenant.acquisition.campaign ? ` · ${tenant.acquisition.campaign}` : ""}</td>
                      <td className="px-3 py-3 text-text-soft">{dateTime(tenant.publishedAt)}</td>
                      <td className="px-3 py-3 text-text-soft">{dateTime(tenant.firstRealBookingAt)}</td>
                      <td className="px-3 py-3 font-semibold text-[var(--theme-text-primary)]">{tenant.subscriptionStatus ?? "—"}</td>
                      <td className="px-3 py-3 text-text-soft">{dateTime(tenant.trialEndsAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </SystemAdminGate>
  );
}
