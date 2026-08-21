import { Badge } from "@/components/landing/flow/badge";
import { Button } from "@/components/landing/flow/button";
import { Card } from "@/components/landing/flow/card";
import { radius, semanticTokens, shadows } from "@/design-system";
import { trackLandingEvent } from "@/lib/landing-analytics";

const agendaItems = [
  {
    time: "08:00",
    title: "Limpeza de pele",
    badge: "Confirmado",
    badgeVariant: "success",
  },
  {
    time: "10:30",
    title: "Corte masculino",
    badge: "Lembrete enviado",
    badgeVariant: "info",
  },
  {
    time: "14:00",
    title: "Manicure",
    badge: "Cliente agendou online",
    badgeVariant: "warning",
  },
  {
    time: "16:00",
    title: "Vitrificação automotiva",
    badge: "Equipe alocada",
    badgeVariant: "neutral",
  },
] as const;

const heroKpis = [
  ["14 dias", "grátis para testar"],
  ["Até 3", "profissionais inclusos"],
  ["Ilimitados", "agendamentos no mês"],
] as const;

const heroMetrics = [
  {
    label: "Cliente",
    value: "PWA",
    detail: "App instalável e Meus compromissos",
  },
  {
    label: "Lembretes",
    value: "Push + e-mail",
    detail: "Canais nativos do Agendoro",
  },
] as const;

function HeroKpiCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Card padding="sm" radiusSize="sm" className="h-full p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--theme-border-strong)] hover:shadow-[var(--theme-shadow-card)]">
      <div className="text-2xl font-extrabold tracking-tight text-secondary">{title}</div>
      <p className="mt-2 text-sm text-text-muted">{subtitle}</p>
    </Card>
  );
}

function HeroAgendaItem({
  badge,
  badgeVariant,
  time,
  title,
}: {
  badge: string;
  badgeVariant: "success" | "warning" | "info" | "neutral";
  time: string;
  title: string;
}) {
  return (
    <div
      className="flex items-center justify-between border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--theme-border-default)] hover:bg-[var(--theme-surface-glass-hover)]"
      style={{ borderRadius: radius.xs }}
    >
      <div className="flex items-center gap-4">
        <div
          className="bg-surface-2 px-3 py-2 text-sm font-bold text-secondary shadow-[inset_0_0_0_1px_var(--theme-border-subtle)]"
          style={{ borderRadius: radius.xs }}
        >
          {time}
        </div>
        <div>
          <p className="font-semibold text-[var(--theme-text-primary)]">{title}</p>
          <p className="text-sm text-text-muted">
            Agendamento online pelo link
          </p>
        </div>
      </div>
      <Badge variant={badgeVariant}>{badge}</Badge>
    </div>
  );
}

function HeroMetricCard({
  detail,
  label,
  value,
}: {
  detail: string;
  label: string;
  value: string;
}) {
  return (
    <Card padding="sm" radiusSize="xs">
      <p className="text-sm text-text-muted">{label}</p>
      <p className="mt-2 text-3xl font-black text-[var(--theme-text-primary)]">{value}</p>
      <p className="mt-1 text-sm text-secondary">{detail}</p>
    </Card>
  );
}

export function Hero() {
  return (
    <section className="px-6 pb-12 pt-8 md:px-10 lg:px-16 lg:pt-12">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
            Agendamento online para negócios que vivem de horário marcado
          </p>

          <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-[var(--theme-text-primary)] md:text-5xl lg:text-6xl">
            Reduza faltas e ganhe tempo com uma agenda online que trabalha por você
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-text-soft md:text-lg">
            Seus clientes escolhem horários sozinhos pelo seu link, recebem
            lembretes automáticos e você gerencia agenda, equipe e serviços em
            um só lugar.
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <Button
              as="a"
              href="/signup"
              onClick={() =>
                trackLandingEvent("landing_trial_cta_clicked", {
                  sourceSection: "hero",
                  target: "/signup",
                  planContext: "agendoro",
                })
              }
            >
              Começar teste grátis de 14 dias
            </Button>
            <Button as="a" href="#como-funciona" variant="secondary">
              Ver como funciona
            </Button>
          </div>

          <p className="mt-4 text-sm text-text-muted">
            🔒 14 dias grátis · Sem cartão de crédito · Cancele quando quiser
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {heroKpis.map(([title, subtitle]) => (
              <HeroKpiCard key={title} title={title} subtitle={subtitle} />
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-xxl bg-[radial-gradient(circle_at_center,var(--theme-overlay-hero),transparent_62%)] blur-3xl" />
          <Card
            padding="sm"
            radiusSize="xl"
            className="relative overflow-hidden before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-primary/50 before:to-transparent"
            style={{
              boxShadow: shadows.soft,
              backdropFilter: `blur(${semanticTokens.blur.shell})`,
            }}
          >
            <Card
              variant="surface"
              padding="sm"
              radiusSize="shell"
              className="p-5"
            >
              <div className="flex items-center justify-between border-b border-[var(--theme-border-subtle)] pb-4">
                <div>
                  <p className="text-sm text-text-muted">Agendoro</p>
                  <h3 className="text-xl font-bold text-[var(--theme-text-primary)]">
                    Agenda do dia
                  </h3>
                </div>
                <div className="rounded-full border border-[var(--theme-border-accent)] bg-linear-to-r from-primary to-secondary px-3 py-1.5 text-xs font-bold text-dark shadow-[var(--theme-shadow-card)]">
                  Online
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {agendaItems.map((item) => (
                  <HeroAgendaItem
                    key={`${item.time}-${item.title}`}
                    {...item}
                  />
                ))}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {heroMetrics.map((metric) => (
                  <HeroMetricCard key={metric.label} {...metric} />
                ))}
              </div>
            </Card>
          </Card>
        </div>
      </div>
    </section>
  );
}
