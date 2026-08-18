import { Link } from "react-router";

import {
  Button,
  CTASection,
  FeatureCard,
  GlassListItem,
  Hero,
  HowItWorks,
  Navbar,
  PainSection,
  PricingSection,
  SectionHeading,
} from "@/components/landing/flow";
import { Card } from "@/components/landing/flow/card";
import { compositionPatterns, semanticTokens } from "@/design-system";
import { trackLandingEvent } from "@/lib/landing-analytics";

const features = [
  {
    title: "Cliente agenda sozinho",
    description:
      "Seu link fica disponível para o cliente escolher serviço, profissional e horário quando for melhor para ele.",
  },
  {
    title: "Rotina mais organizada",
    description:
      "Agenda, profissionais, serviços, bloqueios e clientes ficam em um só lugar para reduzir conflitos.",
  },
  {
    title: "Lembretes automáticos",
    description:
      "Reduza faltas com lembretes por push, e-mail e canais configurados conforme a rotina do negócio.",
  },
];

const benefits = [
  "Atendimento disponível 24h pelo link",
  "Menos retrabalho administrativo",
  "Mais clareza para equipe e profissionais",
  "Experiência mobile para o cliente",
];

const audiences = [
  "Estética automotiva",
  "Salões de beleza",
  "Manicures e nail designers",
  "Lash designers",
  "Barbearias premium",
  "Profissionais autônomos",
];

const resourceModules = [
  {
    title: "Agenda e equipe",
    items: [
      "Agenda desktop e mobile",
      "Gestão de profissionais",
      "Gestão de serviços",
      "Bloqueios e indisponibilidades",
    ],
  },
  {
    title: "Agendamento online",
    items: [
      "Página pública de agendamento",
      "Link próprio",
      "Catálogo de serviços",
      "Clientes ilimitados",
    ],
  },
  {
    title: "Experiência do cliente",
    items: [
      "PWA do cliente",
      "Instalação do app",
      "Meus compromissos",
      "Notificações push",
    ],
  },
  {
    title: "Automações nativas",
    items: [
      "Lembretes por push",
      "Lembretes por e-mail",
      "Múltiplos lembretes configuráveis",
      "Lista de espera e lembrete de retorno",
    ],
  },
];

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-[var(--theme-text-primary)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: compositionPatterns.overlay.marketingPage }}
      />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <PainSection />
        <HowItWorks />

        <section id="beneficios" className="px-6 py-18 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Benefícios"
              title="Mais organização para você. Mais autonomia para o cliente."
              description="Menos tempo respondendo manualmente, mais clareza para a equipe e uma experiência profissional para quem agenda."
            />

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>

            <Card
              padding="lg"
              radiusSize="xl"
              className="mt-8 grid gap-4 lg:grid-cols-2"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
                  Por que funciona
                </p>
                <h3 className="mt-3 text-2xl font-black text-[var(--theme-text-primary)] md:text-4xl">
                  Simples para operar, profissional para quem agenda
                </h3>
              </div>
              <div className="grid gap-3">
                {benefits.map((benefit) => (
                  <GlassListItem
                    key={benefit}
                    icon="✓"
                    //iconSize="lg"
                    label={benefit}
                    size="feature"
                  />
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section id="recursos" className="px-6 py-18 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Recursos"
              title="Os módulos essenciais para uma agenda profissional"
              description="O Agendoro reúne operação, agendamento online, experiência do cliente e lembretes em uma plataforma única para pequenos negócios."
            />

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {resourceModules.map((module) => (
                <Card
                  key={module.title}
                  variant="surface"
                  padding="lg"
                  className="h-full"
                >
                  <h3 className="text-xl font-black text-[var(--theme-text-primary)]">
                    {module.title}
                  </h3>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {module.items.map((item) => (
                      <GlassListItem key={item} icon="✓" label={item} />
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="segmentos" className="px-6 py-18 md:px-10 lg:px-16">
          <Card
            padding="lg"
            className="mx-auto max-w-7xl md:p-10"
            style={{ backdropFilter: `blur(${semanticTokens.blur.shell})` }}
          >
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                eyebrow="Segmentos"
                title="Para qualquer negócio que vive de horário marcado"
                description="Estética, beleza, saúde, consultórios e serviços locais ganham uma agenda mais previsível sem depender de conversa manual para cada horário."
              />
              <Button
                as="a"
                href="#precos"
                onClick={() =>
                  trackLandingEvent("landing_pricing_clicked", {
                    sourceSection: "pricing",
                    target: "#precos",
                    planContext: "agendoro",
                  })
                }
              >
                Quero o Agendoro no meu negócio
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {audiences.map((audience) => (
                <Card
                  key={audience}
                  variant="surface"
                  radiusSize="xl"
                  className="p-6"
                >
                  <div className="text-sm text-secondary">Agendoro</div>
                  <div className="mt-2 text-xl font-bold text-[var(--theme-text-primary)]">
                    {audience}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-text-muted">
                    Estrutura profissional para atrair clientes, organizar
                    horários e oferecer uma experiência consistente.
                  </p>
                </Card>
              ))}
            </div>
          </Card>
        </section>
        <PricingSection />
        <CTASection />

        <footer className="px-6 pb-10 md:px-10 lg:px-16">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 border-t border-[var(--theme-border-subtle)] pt-6 text-sm text-text-muted">
            <Link
              to="/politica-de-privacidade"
              className="transition hover:text-[var(--theme-text-primary)]"
            >
              Política de Privacidade
            </Link>
            <span className="text-text-muted">•</span>
            <Link to="/termos-de-uso" className="transition hover:text-[var(--theme-text-primary)]">
              Termos de Uso
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
