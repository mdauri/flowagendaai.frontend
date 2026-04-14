import { Badge } from "@/components/landing/flow/badge";
import { Button } from "@/components/landing/flow/button";
import { Card } from "@/components/landing/flow/card";
import { radius, semanticTokens, shadows } from "@/design-system";

const WHATSAPP_LINK = import.meta.env.VITE_WHATSAPP_LINK ?? "#";

const agendaItems = [
  {
    time: "08:00",
    title: "Lavagem premium SUV",
    badge: "Confirmado",
    badgeVariant: "success",
  },
  {
    time: "10:30",
    title: "Higienização interior",
    badge: "WhatsApp enviado",
    badgeVariant: "info",
  },
  {
    time: "14:00",
    title: "Alongamento de unhas",
    badge: "Pagamento pendente",
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
  ["+2.500", "agendamentos realizados"],
  ["+120", "clientes atendidos"],
  ["48h", "para sua agenda rodar sozinha"],
] as const;

const heroMetrics = [
  {
    label: "Taxa de ocupação",
    value: "87%",
    detail: "Semana aquecida",
  },
  {
    label: "Mensagens automáticas",
    value: "142",
    detail: "Confirmações enviadas",
  },
] as const;

function HeroKpiCard({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <Card padding="sm" radiusSize="sm" className="p-5">
      <div className="text-2xl font-black text-secondary">{title}</div>
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
      className="flex items-center justify-between border border-white/10 bg-white/5 p-4"
      style={{ borderRadius: radius.xs }}
    >
      <div className="flex items-center gap-4">
        <div
          className="bg-surface-2 px-3 py-2 text-sm font-bold text-secondary"
          style={{ borderRadius: radius.xs }}
        >
          {time}
        </div>
        <div>
          <p className="font-semibold text-white">{title}</p>
          <p className="text-sm text-text-muted">
            Confirmação enviada via WhatsApp
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
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm text-secondary">{detail}</p>
    </Card>
  );
}

export function Hero() {
  return (
    <section className="px-6 pb-16 pt-10 md:px-10 lg:px-16 lg:pt-16">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <Badge
            variant="subtle"
            className="mb-6 px-4 py-2 text-sm text-badge-text"
          >
            Agenda automática · WhatsApp · Google Calendar
          </Badge>

          <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
            Pare de perder clientes por causa da
            <span className="bg-linear-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
              {" "}
              sua agenda
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-text-soft md:text-lg">
            O Agendoro configura tudo pra você. Seus clientes agendam sozinhos,
            as confirmações saem automáticas pelo WhatsApp e sua agenda nunca
            mais vai virar bagunça.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button
              as="a"
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              Quero automatizar minha agenda
            </Button>
            <Button as="a" href="#como-funciona" variant="secondary">
              Ver como funciona
            </Button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {heroKpis.map(([title, subtitle]) => (
              <HeroKpiCard key={title} title={title} subtitle={subtitle} />
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-xxl bg-[radial-gradient(circle_at_center,rgba(255,138,61,0.20),transparent_60%)] blur-3xl" />
          <Card
            padding="sm"
            radiusSize="xl"
            className="relative"
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
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm text-text-muted">Agendoro</p>
                  <h3 className="text-xl font-bold text-white">
                    Agenda do dia
                  </h3>
                </div>
                <div className="rounded-md bg-linear-to-r from-primary to-secondary px-3 py-2 text-xs font-bold text-dark">
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
